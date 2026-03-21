import { describe, expect, it } from 'vitest'
import rentalTaskReducer, {
  progressReported,
  taskSettled,
  taskStarted,
  uploadStarted,
  type RentalTaskState,
} from '../rentalTaskSlice'

const initial: RentalTaskState = {
  taskId: null,
  polling: false,
  isUploading: false,
  progress: 0,
  message: null,
}

describe('rentalTaskSlice', () => {
  it('starts in an idle state', () => {
    expect(rentalTaskReducer(undefined, { type: 'noop' })).toEqual(initial)
  })

  it('marks the upload in flight before a task id exists', () => {
    const state = rentalTaskReducer(initial, uploadStarted())

    expect(state.isUploading).toBe(true)
    expect(state.taskId).toBeNull()
    expect(state.polling).toBe(false)
  })

  it('hands over from uploading to polling once the task id arrives', () => {
    let state = rentalTaskReducer(initial, uploadStarted())
    state = rentalTaskReducer(state, taskStarted('task-abc'))

    expect(state).toMatchObject({ taskId: 'task-abc', polling: true, isUploading: false })
  })

  it('records progress and keeps the last message when a tick omits one', () => {
    let state = rentalTaskReducer(initial, taskStarted('task-abc'))
    state = rentalTaskReducer(state, progressReported({ progress: 45, message: '225 of 500 rows' }))
    expect(state).toMatchObject({ progress: 45, message: '225 of 500 rows' })

    state = rentalTaskReducer(state, progressReported({ progress: 60 }))
    expect(state).toMatchObject({ progress: 60, message: '225 of 500 rows' })
  })

  it('returns to idle when the task settles, so the poll stops', () => {
    let state = rentalTaskReducer(initial, taskStarted('task-abc'))
    state = rentalTaskReducer(state, progressReported({ progress: 90 }))
    state = rentalTaskReducer(state, taskSettled())

    // A null taskId is what `skip: !taskId` reads to stop polling.
    expect(state).toEqual(initial)
  })

  it('settles an upload that never produced a task', () => {
    let state = rentalTaskReducer(initial, uploadStarted())
    state = rentalTaskReducer(state, taskSettled())

    expect(state.isUploading).toBe(false)
    expect(state.polling).toBe(false)
  })
})
