import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import PrivateRoute from '../PrivateRoute'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { type AuthState } from '../../store/slices/authSlice'

const authState = (token: string | null): AuthState => ({
  user: null,
  token,
  sessionExpired: false,
})

const renderWithStore = (token: string | null, initialEntry = '/protected') => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: authState(token),
    },
  })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div>Protected content</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/also-protected"
            element={
              <PrivateRoute>
                <div>Other protected content</div>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('PrivateRoute', () => {
  it('redirects to login when no token is present', () => {
    renderWithStore(null)
    expect(screen.getByText(/login page/i)).toBeInTheDocument()
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
  })

  it('redirects to login when the token is an empty string', () => {
    renderWithStore('')
    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('renders protected content when token exists', () => {
    renderWithStore('fake-token')
    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(screen.queryByText(/login page/i)).not.toBeInTheDocument()
  })

  it('guards every route it wraps, not just the first', () => {
    renderWithStore(null, '/also-protected')
    expect(screen.getByText(/login page/i)).toBeInTheDocument()

    renderWithStore('fake-token', '/also-protected')
    expect(screen.getByText('Other protected content')).toBeInTheDocument()
  })
})
