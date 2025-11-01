/**
 * ScrollMesh Scheduler
 * Time-slicing and priority-based rendering
 * 
 * Ensures smooth 60fps by spreading work across frames
 */

export class RenderScheduler {
  constructor() {
    this.frameDeadline = 16; // 16ms per frame (60fps)
    this.workQueue = {
      high: [],
      normal: [],
      low: [],
    };
    this.isProcessing = false;
    this.currentFrameStart = 0;
  }

  /**
   * Schedule render work
   */
  schedule(task, priority = 'normal') {
    if (!['high', 'normal', 'low'].includes(priority)) {
      priority = 'normal';
    }

    this.workQueue[priority].push(task);

    if (!this.isProcessing) {
      this._processFrame();
    }
  }

  /**
   * Process work in current frame
   */
  _processFrame() {
    this.isProcessing = true;
    this.currentFrameStart = performance.now();

    requestAnimationFrame(() => {
      this._doWork();
    });
  }

  /**
   * Do work until frame deadline
   */
  _doWork() {
    const frameStart = performance.now();

    // Process high priority first
    while (this.workQueue.high.length > 0) {
      if (this._shouldYield(frameStart)) break;
      
      const task = this.workQueue.high.shift();
      this._executeTask(task);
    }

    // Process normal priority
    while (this.workQueue.normal.length > 0) {
      if (this._shouldYield(frameStart)) break;
      
      const task = this.workQueue.normal.shift();
      this._executeTask(task);
    }

    // Process low priority (only if time left)
    while (this.workQueue.low.length > 0) {
      if (this._shouldYield(frameStart)) break;
      
      const task = this.workQueue.low.shift();
      this._executeTask(task);
    }

    // If more work remains, schedule next frame
    if (this._hasWork()) {
      this._processFrame();
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * Execute a single task
   */
  _executeTask(task) {
    try {
      task();
    } catch (error) {
      console.error('[Scheduler] Task execution error:', error);
    }
  }

  /**
   * Check if we should yield to browser
   */
  _shouldYield(frameStart) {
    const elapsed = performance.now() - frameStart;
    return elapsed >= this.frameDeadline;
  }

  /**
   * Check if there's work remaining
   */
  _hasWork() {
    return (
      this.workQueue.high.length > 0 ||
      this.workQueue.normal.length > 0 ||
      this.workQueue.low.length > 0
    );
  }

  /**
   * Clear all queued work
   */
  clear() {
    this.workQueue.high = [];
    this.workQueue.normal = [];
    this.workQueue.low = [];
  }
}

/**
 * Time-Slicing Component Wrapper
 */
export class TimeSlicedComponent {
  constructor(component, config = {}) {
    this.component = component;
    this.config = {
      priority: config.priority || 'normal',
      chunkSize: config.chunkSize || 100, // Items per chunk
      renderStrategy: config.renderStrategy || 'progressive',
    };
    this.scheduler = new RenderScheduler();
  }

  /**
   * Render with time-slicing
   */
  render(data) {
    if (!Array.isArray(data)) {
      // No time-slicing needed for non-lists
      return this.component.render(data);
    }

    if (this.config.renderStrategy === 'progressive') {
      return this._progressiveRender(data);
    } else {
      return this._chunkRender(data);
    }
  }

  /**
   * Progressive rendering - render items in chunks
   */
  _progressiveRender(items) {
    const chunks = this._chunkArray(items, this.config.chunkSize);
    const container = document.createDocumentFragment();

    chunks.forEach((chunk, index) => {
      this.scheduler.schedule(() => {
        chunk.forEach(item => {
          const element = this.component.render(item);
          container.appendChild(element);
        });
      }, this.config.priority);
    });

    return container;
  }

  /**
   * Chunk rendering - render all at once but scheduled
   */
  _chunkRender(items) {
    const container = document.createDocumentFragment();

    this.scheduler.schedule(() => {
      items.forEach(item => {
        const element = this.component.render(item);
        container.appendChild(element);
      });
    }, this.config.priority);

    return container;
  }

  /**
   * Split array into chunks
   */
  _chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Global scheduler instance
export const globalScheduler = new RenderScheduler();

