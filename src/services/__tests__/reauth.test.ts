import { configureStore } from '@reduxjs/toolkit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'
import { baseApi } from '../baseApi'
import authReducer from '../../store/slices/authSlice'

/**
 * The 401 path.
 *
 * Before this existed, an expired JWT simply made every request fail: there
 * was no refresh, and no signal to the app that the session had ended.
 */

const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  })

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

let fetchMock: ReturnType<typeof vi.fn>

const urlsCalled = (): string[] =>
  fetchMock.mock.calls.map((call) => (call[0] as Request).url)

beforeEach(() => {
  localStorage.clear()
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  // Drop every cached subscription so the next test starts clean.
  makeStore().dispatch(baseApi.util.resetApiState())
})

describe('baseQueryWithReauth', () => {
  it('replays the original request after refreshing the token', async () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('refresh_token', 'refresh-token')

    fetchMock
      .mockResolvedValueOnce(json({ detail: 'token expired' }, 401))
      .mockResolvedValueOnce(json({ access: 'fresh-token' }))
      .mockResolvedValueOnce(json({ email: 'ada@example.com' }))

    const store = makeStore()
    const result = await store.dispatch(api.endpoints.getUserProfile.initiate())

    expect(result.data).toEqual({ email: 'ada@example.com' })
    expect(urlsCalled()[1]).toContain('api/token/refresh/')
    // The replay carries the new token, not the expired one.
    const replay = fetchMock.mock.calls[2][0] as Request
    expect(replay.headers.get('authorization')).toBe('Bearer fresh-token')
    expect(localStorage.getItem('token')).toBe('fresh-token')
    expect(store.getState().auth.sessionExpired).toBe(false)
  })

  it('does not attempt a refresh when there is no refresh token', async () => {
    localStorage.setItem('token', 'expired-token')

    fetchMock.mockResolvedValue(json({ detail: 'token expired' }, 401))

    const store = makeStore()
    const result = await store.dispatch(api.endpoints.getUserProfile.initiate())

    expect(result.isError).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.sessionExpired).toBe(true)
  })

  it('ends the session when the refresh itself is rejected', async () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('refresh_token', 'stale-refresh')

    fetchMock
      .mockResolvedValueOnce(json({ detail: 'token expired' }, 401))
      .mockResolvedValueOnce(json({ detail: 'refresh expired' }, 401))

    const store = makeStore()
    const result = await store.dispatch(api.endpoints.getUserProfile.initiate())

    expect(result.isError).toBe(true)
    expect(store.getState().auth.sessionExpired).toBe(true)
    expect(store.getState().auth.token).toBeNull()
    // The dead session must not be left on disk.
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('leaves a non-401 failure alone', async () => {
    localStorage.setItem('refresh_token', 'refresh-token')
    fetchMock.mockResolvedValue(json({ detail: 'forbidden' }, 403))

    const store = makeStore()
    const result = await store.dispatch(api.endpoints.getUserProfile.initiate())

    expect(result.error).toMatchObject({ status: 403 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.sessionExpired).toBe(false)
  })
})
