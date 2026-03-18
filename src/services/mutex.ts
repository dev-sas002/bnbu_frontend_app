/**
 * A minimal async mutex, used to make token refresh single-flight.
 *
 * `async-mutex` would do the same job, but it is a dependency in the critical
 * path of every request for about thirty lines of logic.
 */
export class Mutex {
  /** Callers waiting to take the lock, in arrival order. */
  private acquirers: Array<() => void> = [];
  /** Callers that only want to know when the lock is free. */
  private observers: Array<() => void> = [];
  private locked = false;

  isLocked(): boolean {
    return this.locked;
  }

  /** Resolves with a release function once the lock is held. */
  async acquire(): Promise<() => void> {
    while (this.locked) {
      await new Promise<void>((resolve) => this.acquirers.push(resolve));
    }
    this.locked = true;

    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.locked = false;

      const nextAcquirer = this.acquirers.shift();
      if (nextAcquirer) {
        nextAcquirer();
        return;
      }

      // Nobody wants the lock, so everyone waiting on "is it free yet" can go.
      const waiting = this.observers;
      this.observers = [];
      waiting.forEach((resolve) => resolve());
    };
  }

  /** Resolves as soon as the lock is free, without taking it. */
  async waitForUnlock(): Promise<void> {
    if (!this.locked) return;
    await new Promise<void>((resolve) => this.observers.push(resolve));
  }
}
