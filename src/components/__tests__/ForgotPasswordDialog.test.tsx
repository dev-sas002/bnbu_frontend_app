import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ForgotPasswordDialog, { RESET_SENT_MESSAGE } from '../ForgotPasswordDialog'
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

const renderDialog = (initialEmail = '') =>
  render(
    <Provider store={makeStore()}>
      <ForgotPasswordDialog isOpen onClose={vi.fn()} initialEmail={initialEmail} />
    </Provider>
  )

const send = () => fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))

beforeEach(() => {
  fetchMock = vi.fn(async () =>
    respond(200, { message: 'If that address has an account, a reset link is on its way.' })
  )
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ForgotPasswordDialog', () => {
  it('posts the address to the reset route, pre-filled from the sign-in form', async () => {
    renderDialog('dana@example.com')
    send()

    expect(await screen.findByText(RESET_SENT_MESSAGE)).toBeInTheDocument()
    const request = fetchMock.mock.calls[0][0] as Request
    expect(request.method).toBe('POST')
    expect(request.url).toMatch(/account\/password\/reset\/$/)
    await expect(request.json()).resolves.toEqual({ email: 'dana@example.com' })
  })

  it('gives the same neutral answer for an address with no account', async () => {
    // The API returns 200 here too; the UI must not hint either way.
    renderDialog('nobody@example.com')
    send()

    expect(await screen.findByText(RESET_SENT_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByText(/no account|not found/i)).not.toBeInTheDocument()
  })

  it('explains a 400 as a malformed address', async () => {
    fetchMock.mockResolvedValueOnce(respond(400, { email: ['Enter a valid email address.'] }))
    renderDialog('not-an-email')
    send()

    expect(await screen.findByText('That does not look like an email address.')).toBeInTheDocument()
    expect(screen.queryByText(RESET_SENT_MESSAGE)).not.toBeInTheDocument()
  })

  it('asks for an address before sending anything', () => {
    renderDialog()
    send()

    expect(screen.getByText('Enter the email address you sign in with.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
