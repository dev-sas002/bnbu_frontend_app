import { describe, expect, it } from 'vitest'
import { isAwaitingAnswer } from '../regulationTypes'

describe('isAwaitingAnswer', () => {
  it('is true while the worker has the row queued or running', () => {
    expect(isAwaitingAnswer({ status: 'STR Allowed', analysis_state: 'pending' })).toBe(true)
    expect(isAwaitingAnswer({ status: 'pending', analysis_state: 'running' })).toBe(true)
  })

  it('is false once the lookup finished, whatever the status says', () => {
    // The classifier leaves "pending" on an answer it could not label.
    expect(isAwaitingAnswer({ status: 'pending', analysis_state: 'complete' })).toBe(false)
    expect(isAwaitingAnswer({ status: 'pending', analysis_state: 'failed' })).toBe(false)
    expect(isAwaitingAnswer({ status: 'STR Pending Approval', analysis_state: 'complete' })).toBe(false)
  })

  it('falls back to the pending status for rows without analysis_state', () => {
    expect(isAwaitingAnswer({ status: 'pending' })).toBe(true)
    expect(isAwaitingAnswer({ status: 'STR Not Allowed' })).toBe(false)
  })
})
