import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import authReducer from '../../store/slices/authSlice'
import type { Lease } from '../../types/leaseTypes'

const chatWithGpt = vi.fn()
const refetch = vi.fn()
const pollingResult = {
  data: undefined as unknown,
  error: undefined as unknown,
  refetch,
}

vi.mock('@/hooks/useChatHistoryPolling', () => ({
  default: () => pollingResult,
}))

vi.mock('../../services/api', () => ({
  useChatWithGptMutation: () => [chatWithGpt, { isLoading: false }],
  useGetChatHistoryQuery: () => ({ refetch }),
}))

import ChatBox from '../ChatBox'

const lease: Lease = {
  id: 1,
  date: '2024-01-01',
  address1: '12 Main St',
  city: 'Austin',
  state: 'TX',
  zip_code: '78701',
  status: 'Draft',
  num_of_docs: 1,
}

// No default value: passing `undefined` explicitly has to mean "no document".
const renderChatBox = (documentId: string | undefined) => {
  const store = configureStore({ reducer: { auth: authReducer } })
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ChatBox documentId={documentId} lease={lease} />
      </MemoryRouter>
    </Provider>
  )
}

beforeEach(() => {
  chatWithGpt.mockReset()
  refetch.mockReset()
  pollingResult.data = undefined
  pollingResult.error = undefined
})

describe('ChatBox rendering', () => {
  it('renders without a chat history payload', () => {
    expect(() => renderChatBox('9')).not.toThrow()
    expect(screen.getByPlaceholderText(/LeaseGuard AI/i)).toBeInTheDocument()
  })

  it('renders a document that has never been analysed', () => {
    // No `gpt_response` key at all. Both timestamp reads used to dereference it
    // unconditionally and threw here.
    pollingResult.data = {
      document_uploaded_at: new Date().toISOString(),
      chat_history: [{ role: 'user', content: 'hello', timestamp: '2024-01-01T10:00:00Z' }],
    }

    expect(() => renderChatBox('9')).not.toThrow()
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('shows the messages from the chat history', () => {
    pollingResult.data = {
      document_uploaded_at: new Date().toISOString(),
      gpt_response: { message: null, status: 'Pending', timestamp: null },
      chat_history: [
        { role: 'user', content: 'is this lease ok?', timestamp: '2024-03-01T10:00:00Z' },
        { role: 'assistant', content: 'it looks fine', timestamp: '2024-03-01T10:00:05Z' },
      ],
    }

    renderChatBox('9')

    expect(screen.getByText('is this lease ok?')).toBeInTheDocument()
    expect(screen.getByText('it looks fine')).toBeInTheDocument()
  })

  it('drops history rows that carry no content', () => {
    pollingResult.data = {
      document_uploaded_at: new Date().toISOString(),
      chat_history: [
        { role: 'user', content: 'kept', timestamp: '2024-03-01T10:00:00Z' },
        { role: 'assistant', timestamp: '2024-03-01T10:00:05Z' },
      ],
    }

    renderChatBox('9')

    expect(screen.getByText('kept')).toBeInTheDocument()
    expect(screen.queryByText('Error: Message content missing')).not.toBeInTheDocument()
  })

  it('renders the initial analysis summary when one exists', () => {
    pollingResult.data = {
      document_uploaded_at: new Date().toISOString(),
      gpt_response: {
        message: 'Three clauses need review',
        status: 'Approved',
        timestamp: '2024-03-01T09:00:00Z',
      },
      chat_history: [],
    }

    renderChatBox('9')

    expect(screen.getByText('Initial analysis')).toBeInTheDocument()
    expect(screen.getByText('Three clauses need review')).toBeInTheDocument()
  })

  it('shows an error message when the history query fails', () => {
    pollingResult.error = { status: 500 }

    renderChatBox('9')

    expect(screen.getByText('Error loading chat history')).toBeInTheDocument()
  })
})

describe('ChatBox sending', () => {
  it('keeps Send disabled until something has been typed', () => {
    renderChatBox('9')

    const send = screen.getByRole('button', { name: /send/i })
    expect(send).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText(/LeaseGuard AI/i), {
      target: { value: 'hi' },
    })
    expect(send).toBeEnabled()
  })

  it('ignores whitespace-only input', () => {
    renderChatBox('9')

    fireEvent.change(screen.getByPlaceholderText(/LeaseGuard AI/i), {
      target: { value: '   ' },
    })
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('posts the message, clears the box and appends the reply', async () => {
    chatWithGpt.mockReturnValue({
      unwrap: async () => ({
        response: 'here is the answer',
        chat_history: [{ role: 'assistant', content: 'here is the answer', timestamp: '2024-03-01T10:00:05Z' }],
      }),
    })
    renderChatBox('9')

    const input = screen.getByPlaceholderText(/LeaseGuard AI/i)
    fireEvent.change(input, { target: { value: 'is this lease ok?' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(chatWithGpt).toHaveBeenCalledWith({
        documentId: '9',
        message: 'is this lease ok?',
      })
    })
    await waitFor(() => {
      expect(screen.getByText('here is the answer')).toBeInTheDocument()
    })
    expect(input).toHaveValue('')
  })

  it('does not blow up when the send fails', async () => {
    chatWithGpt.mockReturnValue({
      unwrap: async () => {
        throw new Error('network down')
      },
    })
    renderChatBox('9')

    fireEvent.change(screen.getByPlaceholderText(/LeaseGuard AI/i), {
      target: { value: 'hello' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(screen.queryByText(/is typing/i)).not.toBeInTheDocument()
    })
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('sends nothing when there is no document id', () => {
    renderChatBox(undefined)

    fireEvent.change(screen.getByPlaceholderText(/LeaseGuard AI/i), {
      target: { value: 'hello' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))

    expect(chatWithGpt).not.toHaveBeenCalled()
  })
})
