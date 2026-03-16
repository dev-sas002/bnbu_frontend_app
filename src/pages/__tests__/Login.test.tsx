import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Login from '../Login'
import { api } from '../../services/api'
import authReducer from '../../store/slices/authSlice'

const makeStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })

let fetchMock: ReturnType<typeof vi.fn>
let store: ReturnType<typeof makeStore>

const renderLogin = () => {
  store = makeStore()
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

// The labels carry a required marker, and the reveal control is a real button
// with its own accessible name, so these anchor on the start of the label.
const fillIn = (label: RegExp, value: string) => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

const emailField = () => screen.getByLabelText(/^email/i)
const passwordField = () => screen.getByLabelText(/^password/i)

const submit = () => fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

beforeEach(() => {
  localStorage.clear()
  fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ access: 'jwt-token', refresh: 'r' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
  )
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Login validation', () => {
  it('reports both fields when the form is empty and sends no request', () => {
    renderLogin()
    submit()

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports only the missing password when an email is present', () => {
    renderLogin()
    fillIn(/^email/i, 'user@example.com')
    submit()

    expect(screen.queryByText('Please enter a valid email')).not.toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('Login submission', () => {
  it('stores the token and navigates to the dashboard on success', async () => {
    renderLogin()
    fillIn(/^email/i, 'user@example.com')
    fillIn(/^password/i, 'hunter2')
    submit()

    await waitFor(() => {
      expect(screen.getByText('Dashboard page')).toBeInTheDocument()
    })

    expect(store.getState().auth.token).toBe('jwt-token')
    expect(localStorage.getItem('token')).toBe('jwt-token')
  })

  it('shows an error and stays put when the API rejects the credentials', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'No active account' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    renderLogin()
    fillIn(/^email/i, 'user@example.com')
    fillIn(/^password/i, 'wrong')
    submit()

    await waitFor(() => {
      expect(screen.getByText('Failed to log in')).toBeInTheDocument()
    })
    expect(screen.getByText('Please check your credentials and try again')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })
})

describe('Remember Me', () => {
  it('never writes the password to localStorage', async () => {
    renderLogin()
    fireEvent.click(screen.getByLabelText(/remember me/i))
    fillIn(/^email/i, 'user@example.com')
    fillIn(/^password/i, 'hunter2')
    submit()

    await waitFor(() => {
      expect(screen.getByText('Dashboard page')).toBeInTheDocument()
    })

    expect(localStorage.getItem('email')).toBe('user@example.com')
    expect(localStorage.getItem('password')).toBeNull()
    expect(Object.values({ ...localStorage })).not.toContain('hunter2')
  })

  it('prefills the remembered email and clears any legacy stored password', () => {
    localStorage.setItem('rememberMe', 'true')
    localStorage.setItem('email', 'remembered@example.com')
    localStorage.setItem('password', 'left-over-from-an-older-build')

    renderLogin()

    expect(emailField()).toHaveValue('remembered@example.com')
    expect(passwordField()).toHaveValue('')
    expect(localStorage.getItem('password')).toBeNull()
  })

  it('forgets the email when Remember Me is switched off', async () => {
    localStorage.setItem('rememberMe', 'true')
    localStorage.setItem('email', 'remembered@example.com')

    renderLogin()
    fireEvent.click(screen.getByLabelText(/remember me/i))

    expect(localStorage.getItem('rememberMe')).toBeNull()
    expect(localStorage.getItem('email')).toBeNull()
  })
})

describe('password visibility toggle', () => {
  it('switches the input between password and text', () => {
    renderLogin()
    const input = passwordField()
    expect(input).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: /reveal the password/i }))
    expect(input).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: /hide the password/i }))
    expect(input).toHaveAttribute('type', 'password')
  })
})
