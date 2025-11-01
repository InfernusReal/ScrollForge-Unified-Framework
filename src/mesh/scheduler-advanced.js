/**
 * Advanced Scheduler
 * Priority lanes: input > animation > network > idle
 * Micro-chunking for long tasks
 */

export class AdvancedScheduler {
  constructor() {
    this.lanes = {
      input: [],      // Highest priority (user interactions)
      animation: [],  // High priority (animations, transitions)
      network: [],    // Normal priority (data fetching)
      idle: []        // Lowest priority (analytics, logging)
    };
    
    this.frameDeadline = 16; // 16ms for 60fps
    this.isProcessing = false;
    this.currentPriority = null;
  }

  /**
   * Schedule task with priority
   */
  schedule(task, priority = 'animation') {
    if (!this.lanes[priority]) {
      priority = 'animation';
    }

    this.lanes[priority].push(task);

    if (!this.isProcessing) {
      this._processFrame();
    }
  }

  /**
   * Process frame with priority lanes
   */
  _processFrame() {
    this.isProcessing = true;

    requestAnimationFrame(() => {
      const frameStart = performance.now();

      // Input lane (highest priority)
      this._processLane('input', frameStart, 8); // 8ms budget

      // Animation lane
      if (!this._shouldYield(frameStart)) {
        this._processLane('animation', frameStart, 12); // 12ms total
      }

      // Network lane
      if (!this._shouldYield(frameStart)) {
        this._processLane('network', frameStart, 14); // 14ms total
      }

      // Idle lane (only if time left)
      if (!this._shouldYield(frameStart)) {
        this._processLane('idle', frameStart, 16); // 16ms total
      }

      // Continue if more work
      if (this._hasWork()) {
        this._processFrame();
      } else {
        this.isProcessing = false;
      }
    });
  }

  /**
   * Process single lane
   */
  _processLane(laneName, frameStart, budget) {
    const lane = this.lanes[laneName];
    this.currentPriority = laneName;

    while (lane.length > 0) {
      const elapsed = performance.now() - frameStart;
      if (elapsed >= budget) break;

      const task = lane.shift();
      
      try {
        task();
      } catch (error) {
        console.error(`[Scheduler:${laneName}] Task error:`, error);
      }
    }
  }

  /**
   * Check if should yield to browser
   */
  _shouldYield(frameStart) {
    return (performance.now() - frameStart) >= this.frameDeadline;
  }

  /**
   * Check if there's work remaining
   */
  _hasWork() {
    return Object.values(this.lanes).some(lane => lane.length > 0);
  }

  /**
   * Chunk long task into micro-chunks
   */
  chunkTask(items, processFn, options = {}) {
    const {
      chunkSize = 100,
      priority = 'idle',
      onProgress,
      onComplete
    } = options;

    let processed = 0;

    const processChunk = () => {
      const chunk = items.slice(processed, processed + chunkSize);
      
      chunk.forEach((item, index) => {
        processFn(item, processed + index);
      });

      processed += chunk.length;

      if (onProgress) {
        onProgress(processed, items.length);
      }

      if (processed < items.length) {
        this.schedule(processChunk, priority);
      } else if (onComplete) {
        onComplete();
      }
    };

    this.schedule(processChunk, priority);
  }

  /**
   * Request idle callback (run when browser idle)
   */
  whenIdle(fn) {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(fn);
    } else {
      this.schedule(fn, 'idle');
    }
  }

  /**
   * Get lane stats
   */
  getStats() {
    return {
      input: this.lanes.input.length,
      animation: this.lanes.animation.length,
      network: this.lanes.network.length,
      idle: this.lanes.idle.length,
      total: Object.values(this.lanes).reduce((sum, lane) => sum + lane.length, 0),
      currentPriority: this.currentPriority,
      processing: this.isProcessing
    };
  }

  /**
   * Clear all lanes
   */
  clear() {
    Object.keys(this.lanes).forEach(key => {
      this.lanes[key] = [];
    });
  }
}

export const globalAdvancedScheduler = new AdvancedScheduler();

export function schedule(task, priority) {
  globalAdvancedScheduler.schedule(task, priority);
}

export function chunkTask(items, processFn, options) {
  globalAdvancedScheduler.chunkTask(items, processFn, options);
}

