/**
 * Priority Hints System
 * Declarative priority for renders and updates
 */

export class PriorityHints {
  constructor(scheduler) {
    this.scheduler = scheduler;
    this.componentPriorities = new Map();
  }

  /**
   * Set component priority
   */
  setPriority(componentId, priority) {
    this.componentPriorities.set(componentId, priority);
  }

  /**
   * Get component priority
   */
  getPriority(componentId) {
    return this.componentPriorities.get(componentId) || 'animation';
  }

  /**
   * useFrame hook with priority
   */
  useFrame(callback, priority = 'animation') {
    let rafId;
    let running = true;

    const loop = (timestamp) => {
      if (!running) return;

      this.scheduler.schedule(() => {
        callback(timestamp);
      }, priority);

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
  }

  /**
   * Defer to idle
   */
  whenIdle(fn) {
    this.scheduler.schedule(fn, 'idle');
  }

  /**
   * Immediate (input priority)
   */
  immediate(fn) {
    this.scheduler.schedule(fn, 'input');
  }

  /**
   * Batch updates by priority
   */
  batchUpdates(updates, priority = 'animation') {
    updates.forEach(update => {
      this.scheduler.schedule(update, priority);
    });
  }
}

export function createPriorityHints(scheduler) {
  return new PriorityHints(scheduler);
}

