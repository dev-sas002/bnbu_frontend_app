import { beforeEach, describe, expect, it } from 'vitest'
import authReducer, {
  acknowledgeSessionExpiry,
  logout,
  sessionExpired,
  setCredentials,
  setSession,
  setToken,
  type AuthState,
  type User,
} from '../authSlice'

/**
 * The three `refresh*` booleans this slice used to carry are gone: cross-page
 * refreshes are RTK Query cache tags now (see src/services/baseApi.ts), and
 * the background-task flags moved to rentalTaskSlice. What remains is the
 * session, so that is what these cover.
 */

const user: User = {
  id: 7,
  email: 'agent@example.com',
  user_type: 'admin',
  is_first_login: false,
}

const baseState = (): AuthState => ({
  user: null,
  token: null,
  sessionExpired: false,
})

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns the initial state for an unknown action', () => {
    const state = authReducer(undefined, { type: 'noop' })

    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.sessionExpired).toBe(false)
  })

  it('setCredentials stores the user and token in state and localStorage', () => {
    const state = authReducer(baseState(), setCredentials({ user, token: 'jwt-123' }))

    expect(state.user).toEqual(user)
    expect(state.token).toBe('jwt-123')
    expect(localStorage.getItem('token')).toBe('jwt-123')
    expect(JSON.parse(localStorage.getItem('user') as string)).toEqual(user)
  })

  it('setToken stores only the token', () => {
    const state = authReducer(baseState(), setToken('jwt-456'))

    expect(state.token).toBe('jwt-456')
    expect(state.user).toBeNull()
    expect(localStorage.getItem('token')).toBe('jwt-456')
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('setSession persists both halves of the token pair', () => {
    const state = authReducer(baseState(), setSession({ access: 'access-1', refresh: 'refresh-1' }))

    expect(state.token).toBe('access-1')
    expect(localStorage.getItem('token')).toBe('access-1')
    // The refresh token is what lets baseQueryWithReauth replay a 401.
    expect(localStorage.getItem('refresh_token')).toBe('refresh-1')
  })

  it('setSession tolerates a response with no refresh token', () => {
    const state = authReducer(baseState(), setSession({ access: 'access-only' }))

    expect(state.token).toBe('access-only')
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('logout clears state and the persisted session', () => {
    const signedIn = authReducer(baseState(), setCredentials({ user, token: 'jwt-123' }))
    localStorage.setItem('refresh_token', 'refresh-1')

    const state = authReducer(signedIn, logout())

    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.sessionExpired).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('sessionExpired clears the session and raises the flag', () => {
    const signedIn = authReducer(baseState(), setCredentials({ user, token: 'jwt-123' }))
    localStorage.setItem('refresh_token', 'refresh-1')

    const state = authReducer(signedIn, sessionExpired())

    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.sessionExpired).toBe(true)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('acknowledgeSessionExpiry lowers the flag without touching the session', () => {
    const expired = authReducer(baseState(), sessionExpired())
    const state = authReducer(expired, acknowledgeSessionExpiry())

    expect(state.sessionExpired).toBe(false)
    expect(state.token).toBeNull()
  })

  it('signing back in clears a pending expiry notice', () => {
    const expired = authReducer(baseState(), sessionExpired())
    const state = authReducer(expired, setSession({ access: 'fresh', refresh: 'r' }))

    expect(state.sessionExpired).toBe(false)
    expect(state.token).toBe('fresh')
  })
})
