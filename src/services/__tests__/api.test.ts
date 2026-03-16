import { configureStore } from '@reduxjs/toolkit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'
import authReducer, { setToken } from '../../store/slices/authSlice'

/**
 * These exercise the RTK Query endpoint definitions -- the URLs, methods,
 * bodies and auth header the app actually puts on the wire. `fetch` is stubbed,
 * so nothing leaves the process.
 */

const makeStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })

let fetchMock: ReturnType<typeof vi.fn>

const jsonResponse = (body: unknown = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

const lastRequest = (): Request => fetchMock.mock.calls[0][0] as Request

beforeEach(() => {
  localStorage.clear()
  fetchMock = vi.fn(async () => jsonResponse({ results: [], next: null }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('auth header', () => {
  it('sends the token held in the store', async () => {
    const store = makeStore()
    store.dispatch(setToken('store-token'))

    await store.dispatch(api.endpoints.getDashboard.initiate(undefined))

    expect(lastRequest().headers.get('authorization')).toBe('Bearer store-token')
  })

  it('falls back to the token persisted in localStorage', async () => {
    localStorage.setItem('token', 'persisted-token')
    const store = makeStore()

    await store.dispatch(api.endpoints.getDashboard.initiate(undefined))

    expect(lastRequest().headers.get('authorization')).toBe('Bearer persisted-token')
  })

  it('sends no authorization header when signed out', async () => {
    const store = makeStore()

    await store.dispatch(api.endpoints.getDashboard.initiate(undefined))

    expect(lastRequest().headers.get('authorization')).toBeNull()
  })
})

describe('login', () => {
  it('POSTs credentials to the token endpoint', async () => {
    const store = makeStore()

    await store.dispatch(
      api.endpoints.login.initiate({ email: 'a@b.com', password: 'secret' })
    )

    const request = lastRequest()
    expect(request.method).toBe('POST')
    expect(request.url).toContain('api/token/')
    await expect(request.json()).resolves.toEqual({ email: 'a@b.com', password: 'secret' })
  })
})

describe('pagination', () => {
  it('getUsers defaults to page 1', async () => {
    const store = makeStore()
    await store.dispatch(api.endpoints.getUsers.initiate(undefined))
    expect(lastRequest().url).toContain('account/users/?page=1')
  })

  it('getAllLeases passes the requested page through', async () => {
    const store = makeStore()
    await store.dispatch(api.endpoints.getAllLeases.initiate(4))
    expect(lastRequest().url).toContain('api/leases/?page=4')
  })
})

describe('searchLeases query building', () => {
  it('encodes every supplied filter and drops the trailing separator', async () => {
    const store = makeStore()

    await store.dispatch(
      api.endpoints.searchLeases.initiate({
        page: 2,
        address: '12 Main St',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        status: 'Draft',
      })
    )

    const url = lastRequest().url
    expect(url).toContain('api/leases/search/?')
    expect(url).toContain('page=2')
    expect(url).toContain('address=12%20Main%20St')
    expect(url).toContain('start_date=2024-01-01')
    expect(url).toContain('end_date=2024-01-31')
    expect(url).toContain('status=Draft')
    expect(url.endsWith('&')).toBe(false)
  })

  it('omits filters that were not supplied', async () => {
    const store = makeStore()

    await store.dispatch(api.endpoints.searchLeases.initiate({ address: 'Elm' }))

    const url = lastRequest().url
    expect(url).toContain('address=Elm')
    expect(url).not.toContain('start_date')
    expect(url).not.toContain('status=')
    expect(url.endsWith('&')).toBe(false)
  })

  it('tolerates being called with no params at all', async () => {
    const store = makeStore()

    await store.dispatch(api.endpoints.searchLeases.initiate(undefined))

    expect(lastRequest().url).toContain('api/leases/search/?')
  })
})

describe('searchRegulations query building', () => {
  it('uses the regulations search endpoint and the `query` parameter', async () => {
    const store = makeStore()

    await store.dispatch(
      api.endpoints.searchRegulations.initiate({ page: 1, query: 'Austin, TX' })
    )

    const url = lastRequest().url
    expect(url).toContain('api/regulations/search/?')
    expect(url).toContain('query=Austin%2C%20TX')
  })
})

describe('rental endpoints', () => {
  it('filteredList POSTs the filters and repeats paging in the query string', async () => {
    const store = makeStore()

    await store.dispatch(
      api.endpoints.filteredList.initiate({
        min_profit: '100',
        status: 'Approved',
        page: 3,
        pageSize: 50,
      })
    )

    const request = lastRequest()
    expect(request.method).toBe('POST')
    expect(request.url).toContain('page=3')
    expect(request.url).toContain('page_size=50')

    const body = await request.json()
    expect(body).toMatchObject({ min_profit: '100', status: 'Approved', page_size: 50 })
    // Filters that were not supplied must not be sent as undefined keys.
    expect(Object.keys(body)).not.toContain('max_profit')
  })

  it('downloadCsv only sends the filters that are set', async () => {
    const store = makeStore()

    await store.dispatch(
      api.endpoints.downloadCsv.initiate({ status: 'Approved', min_profit: 250 })
    )

    const url = lastRequest().url
    expect(url).toContain('api/rental_properties/download-csv/')
    expect(url).toContain('status=Approved')
    expect(url).toContain('min_profit=250')
    expect(url).not.toContain('batch_id')
  })

  it('taskProgress targets the progress endpoint for the given task', async () => {
    const store = makeStore()

    await store.dispatch(api.endpoints.taskProgress.initiate('task-xyz'))

    expect(lastRequest().url).toContain(
      'api/rental_properties/task-progress/?task_id=task-xyz'
    )
  })
})

describe('document endpoints', () => {
  it('reviewDocuments sends the ids under document_ids', async () => {
    const store = makeStore()

    await store.dispatch(
      api.endpoints.reviewDocuments.initiate({ documentIds: [1, 2, 3] })
    )

    const request = lastRequest()
    expect(request.method).toBe('POST')
    expect(request.url).toContain('api/documents/review/')
    await expect(request.json()).resolves.toEqual({ document_ids: [1, 2, 3] })
  })

  it('chatWithGpt posts the message alongside the document id', async () => {
    const store = makeStore()

    await store.dispatch(
      api.endpoints.chatWithGpt.initiate({ documentId: '9', message: 'hello' })
    )

    const request = lastRequest()
    expect(request.url).toContain('api/documents/9/chat/')
    await expect(request.json()).resolves.toEqual({ document_id: '9', message: 'hello' })
  })

  it('surfaces a failing response as an error result', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'nope' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const store = makeStore()

    const result = await store.dispatch(api.endpoints.getDashboard.initiate(undefined))

    expect(result.isError).toBe(true)
    expect(result.error).toMatchObject({ status: 403 })
  })
})
