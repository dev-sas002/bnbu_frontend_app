import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const useGetChatHistoryQuery = vi.fn()
const refetch = vi.fn()

vi.mock('@/services/api', () => ({
  useGetChatHistoryQuery: (...args: unknown[]) => useGetChatHistoryQuery(...args),
}))

import useChatHistoryPolling, {
  POLLS_PER_STAGE,
  POLL_SCHEDULE_MS,
  pollIntervalFor,
} from '../useChatHistoryPolling'

/** The options object the hook passed to RTK Query on its most recent render. */
const lastOptions = () =>
  useGetChatHistoryQuery.mock.calls[useGetChatHistoryQuery.mock.calls.length - 1][1] as {
    skip: boolean
    pollingInterval: number
  }

beforeEach(() => {
  vi.useFakeTimers()
  refetch.mockClear()
  useGetChatHistoryQuery.mockReset()
  useGetChatHistoryQuery.mockReturnValue({
    data: { chat_history: [] },
    error: undefined,
    isFetching: false,
    refetch,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('pollIntervalFor', () => {
  it('widens through the schedule and then holds at the longest interval', () => {
    expect(pollIntervalFor(0)).toBe(POLL_SCHEDULE_MS[0])
    expect(pollIntervalFor(2)).toBe(POLL_SCHEDULE_MS[2])
    expect(pollIntervalFor(99)).toBe(POLL_SCHEDULE_MS[POLL_SCHEDULE_MS.length - 1])
  })

  it('clamps a negative stage to the first interval', () => {
    expect(pollIntervalFor(-1)).toBe(POLL_SCHEDULE_MS[0])
  })
})

describe('useChatHistoryPolling', () => {
  it('skips the query when there is no document id', () => {
    renderHook(() => useChatHistoryPolling(undefined, true))

    expect(useGetChatHistoryQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ skip: true }))
    expect(lastOptions().pollingInterval).toBe(0)
  })

  it('starts polling at the first interval for a given document', () => {
    renderHook(() => useChatHistoryPolling('42', true))

    expect(lastOptions().skip).toBe(false)
    expect(lastOptions().pollingInterval).toBe(POLL_SCHEDULE_MS[0])
  })

  it('does not poll while polling is paused', () => {
    renderHook(() => useChatHistoryPolling('42', false))

    act(() => {
      vi.advanceTimersByTime(60_000)
    })

    expect(lastOptions().pollingInterval).toBe(0)
  })

  it('backs off one stage at a time as the wait goes on', () => {
    renderHook(() => useChatHistoryPolling('42', true))
    expect(lastOptions().pollingInterval).toBe(POLL_SCHEDULE_MS[0])

    act(() => {
      vi.advanceTimersByTime(POLL_SCHEDULE_MS[0] * POLLS_PER_STAGE)
    })
    expect(lastOptions().pollingInterval).toBe(POLL_SCHEDULE_MS[1])

    act(() => {
      vi.advanceTimersByTime(POLL_SCHEDULE_MS[1] * POLLS_PER_STAGE)
    })
    expect(lastOptions().pollingInterval).toBe(POLL_SCHEDULE_MS[2])
  })

  it('stops widening once it reaches the longest interval', () => {
    renderHook(() => useChatHistoryPolling('42', true))

    // One `act` per stage: the next timer is only scheduled by the effect that
    // runs after the previous stage's re-render is flushed.
    POLL_SCHEDULE_MS.forEach((interval) => {
      act(() => {
        vi.advanceTimersByTime(interval * POLLS_PER_STAGE)
      })
    })

    expect(lastOptions().pollingInterval).toBe(POLL_SCHEDULE_MS[POLL_SCHEDULE_MS.length - 1])

    // And it stays there rather than running off the end of the schedule.
    act(() => {
      vi.advanceTimersByTime(5 * 60_000)
    })
    expect(lastOptions().pollingInterval).toBe(POLL_SCHEDULE_MS[POLL_SCHEDULE_MS.length - 1])
  })

  it('restarts at the first interval when polling is re-enabled', () => {
    const { rerender } = renderHook(
      ({ shouldPoll }: { shouldPoll: boolean }) => useChatHistoryPolling('42', shouldPoll),
      { initialProps: { shouldPoll: true } }
    )

    act(() => {
      vi.advanceTimersByTime(POLL_SCHEDULE_MS[0] * POLLS_PER_STAGE * 3)
    })
    expect(lastOptions().pollingInterval).not.toBe(POLL_SCHEDULE_MS[0])

    rerender({ shouldPoll: false })
    rerender({ shouldPoll: true })

    expect(lastOptions().pollingInterval).toBe(POLL_SCHEDULE_MS[0])
  })

  it('pauses entirely while the tab is hidden', () => {
    const { rerender } = renderHook(() => useChatHistoryPolling('42', true))
    expect(lastOptions().pollingInterval).toBeGreaterThan(0)

    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    rerender()

    expect(lastOptions().pollingInterval).toBe(0)

    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    rerender()

    expect(lastOptions().pollingInterval).toBeGreaterThan(0)
  })

  it('returns the query data, error and refetch straight through', () => {
    const error = { status: 500 }
    useGetChatHistoryQuery.mockReturnValue({
      data: { chat_history: [{ role: 'user', content: 'hi' }] },
      error,
      isFetching: true,
      refetch,
    })

    const { result } = renderHook(() => useChatHistoryPolling('42', true))

    expect(result.current.data).toEqual({ chat_history: [{ role: 'user', content: 'hi' }] })
    expect(result.current.error).toBe(error)
    expect(result.current.isFetching).toBe(true)
    expect(result.current.refetch).toBe(refetch)
  })
})
