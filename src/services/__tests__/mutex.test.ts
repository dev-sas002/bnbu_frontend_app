import { describe, expect, it } from 'vitest'
import { Mutex } from '../mutex'

/**
 * This exists so a dashboard firing six queries at once cannot fire six token
 * refreshes, five of which would race the sixth's rotation and fail.
 */
describe('Mutex', () => {
  it('reports whether it is held', async () => {
    const mutex = new Mutex()
    expect(mutex.isLocked()).toBe(false)

    const release = await mutex.acquire()
    expect(mutex.isLocked()).toBe(true)

    release()
    expect(mutex.isLocked()).toBe(false)
  })

  it('serialises acquirers in arrival order', async () => {
    const mutex = new Mutex()
    const order: number[] = []

    const run = async (id: number) => {
      const release = await mutex.acquire()
      order.push(id)
      release()
    }

    const first = await mutex.acquire()
    const waiters = [run(1), run(2), run(3)]
    expect(order).toEqual([])

    first()
    await Promise.all(waiters)

    expect(order).toEqual([1, 2, 3])
  })

  it('ignores a release called twice', async () => {
    const mutex = new Mutex()
    const release = await mutex.acquire()

    release()
    release()

    expect(mutex.isLocked()).toBe(false)
  })

  it('resolves waitForUnlock immediately when free', async () => {
    const mutex = new Mutex()
    await expect(mutex.waitForUnlock()).resolves.toBeUndefined()
  })

  it('holds waitForUnlock until the lock is released, without taking it', async () => {
    const mutex = new Mutex()
    const release = await mutex.acquire()

    let released = false
    const waiting = mutex.waitForUnlock().then(() => {
      released = true
    })

    await Promise.resolve()
    expect(released).toBe(false)

    release()
    await waiting

    expect(released).toBe(true)
    // The observer must not have taken the lock on its way past.
    expect(mutex.isLocked()).toBe(false)
  })
})
