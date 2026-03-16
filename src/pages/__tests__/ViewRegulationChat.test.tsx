import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ViewRegulationChat from '../ViewRegulationChat'
import { api } from '../../services/api'
import authReducer from '../../store/slices/authSlice'

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })

const answered = {
  id: 6,
  date: '2026-11-07',
  search: 'Porto, Portugal',
  status: 'STR Allowed with Restrictions',
  gpt_response: { status: 'STR Allowed with Restrictions', message: 'Register annually.' },
  chat_history: [],
  analysis_state: 'complete',
  source: 'llm:demo',
}

const respond = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

let regulationRow: Record<string, unknown>
let fetchMock: ReturnType<typeof vi.fn>

const renderPage = () =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={['/regulation/6/chat']}>
        <Routes>
          <Route path="/regulation/:regulationId/chat" element={<ViewRegulationChat />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )

beforeEach(() => {
  // jsdom has no scrollIntoView; the chat panel scrolls to its last message.
  Element.prototype.scrollIntoView = vi.fn()
  regulationRow = answered
  fetchMock = vi.fn(async (request: Request) => {
    if (request.url.endsWith('/reanalyze/')) {
      // The API's 202: queued like a new search, previous answer still attached.
      regulationRow = { ...answered, analysis_state: 'pending' }
      return respond(202, regulationRow)
    }
    if (request.url.endsWith('/get-chat-history/')) {
      return respond(200, { gpt_response: answered.gpt_response, chat_history: [] })
    }
    return respond(200, regulationRow)
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ViewRegulationChat re-analysis', () => {
  it('posts to reanalyze and treats a 202 as a search in progress', async () => {
    renderPage()
    const lookAgain = await screen.findByRole('button', { name: /look again/i })
    expect(screen.queryByText(/is researching this search/)).not.toBeInTheDocument()

    fireEvent.click(lookAgain)

    expect(await screen.findByText(/is researching this search/)).toBeInTheDocument()
    expect(screen.getByText(/the previous answer is shown until then/)).toBeInTheDocument()
    const post = fetchMock.mock.calls
      .map(([request]) => request as Request)
      .find((request) => request.method === 'POST')
    expect(post?.url).toMatch(/api\/regulations\/6\/reanalyze\/$/)
    await waitFor(() => expect(screen.getByRole('button', { name: /look again/i })).toBeDisabled())
  })

  it('offers a retry when the last lookup failed', async () => {
    regulationRow = { ...answered, analysis_state: 'failed' }
    renderPage()

    expect(await screen.findByText(/The last lookup failed/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /look again/i })).toBeEnabled()
  })
})
