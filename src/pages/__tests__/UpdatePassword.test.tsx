import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UpdatePassword from '../UpdatePassword'
import { api } from '../../services/api'
import authReducer from '../../store/slices/authSlice'

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })

let fetchMock: ReturnType<typeof vi.fn>

const respond = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const renderPage = () =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={['/update-password/12']}>
        <Routes>
          <Route path="/update-password/:id" element={<UpdatePassword />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )

const fillAndSubmit = (password: string, confirmation = password) => {
  fireEvent.change(screen.getByLabelText(/^new password/i), { target: { value: password } })
  fireEvent.change(screen.getByLabelText(/^confirm password/i), { target: { value: confirmation } })
  fireEvent.click(screen.getByRole('button', { name: /set password/i }))
}

beforeEach(() => {
  fetchMock = vi.fn(async () => respond(200, { message: 'Password updated successfully' }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('UpdatePassword', () => {
  it('POSTs new_password and confirm_password, the fields the API validates', async () => {
    renderPage()
    fillAndSubmit('long-enough-pass')

    await waitFor(() => expect(screen.getByText('Dashboard page')).toBeInTheDocument())

    const request = fetchMock.mock.calls[0][0] as Request
    expect(request.method).toBe('POST')
    expect(request.url).toMatch(/account\/users\/update-password\/12\/$/)
    await expect(request.json()).resolves.toEqual({
      new_password: 'long-enough-pass',
      confirm_password: 'long-enough-pass',
    })
  })

  it('shows the password validator message the API sends back', async () => {
    fetchMock.mockResolvedValueOnce(
      respond(400, { new_password: ['This password is too common.'] })
    )
    renderPage()
    fillAndSubmit('password123')

    expect(await screen.findByText('This password is too common.')).toBeInTheDocument()
  })

  it('checks the confirmation locally and sends nothing on a mismatch', () => {
    renderPage()
    fillAndSubmit('long-enough-pass', 'something-else')

    expect(screen.getByText('The two passwords do not match.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
