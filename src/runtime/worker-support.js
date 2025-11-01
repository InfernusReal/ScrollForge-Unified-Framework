/**
 * Web Worker Support
 * Offload heavy computations to background threads
 */

export class WorkerPool {
  constructor(size = 4) {
    this.size = size;
    this.workers = [];
    this.tasks = [];
    this.activeJobs = new Map();
    this.moduleRegistry = new Map(); // name -> { descriptor, functionRef }
    this.generatedModuleURLs = new Set();
    this.functionModuleCache = new WeakMap();
    this.finalizationRegistry = this._createFinalizationRegistry();
    this.workerScriptURL = null;
    this.taskIdCounter = 0;
    
    this._initializeWorkers();
  }

  _initializeWorkers() {
    const workerCode = `
      const moduleCache = new Map();

      self.onmessage = async (event) => {
        const { id, moduleURL, exportName, args } = event.data;
        try {
          let mod = moduleCache.get(moduleURL);
          if (!mod) {
            mod = await import(moduleURL);
            moduleCache.set(moduleURL, mod);
          }
          let handler = exportName ? mod[exportName] : mod.default;
          if (typeof handler !== 'function') {
            throw new Error('Export "' + (exportName || 'default') + '" is not a function');
          }
          const result = await handler(...args);
          self.postMessage({ id, result, error: null });
        } catch (error) {
          self.postMessage({ id, result: null, error: error?.message || String(error) });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    if (this.workerScriptURL) {
      URL.revokeObjectURL(this.workerScriptURL);
    }
    const workerURL = URL.createObjectURL(blob);
    this.workerScriptURL = workerURL;

    for (let i = 0; i < this.size; i++) {
      const worker = new Worker(workerURL, { type: 'module' });
      worker._busy = false;
      
      worker.onmessage = (e) => {
        this._handleWorkerResponse(worker, e.data);
      };
      
      this.workers.push(worker);
    }

    console.log(`[WorkerPool] Initialized ${this.size} workers`);
  }

  /**
   * Run task in worker
   */
  async run(taskDefinition, ...args) {
    const { descriptor, functionRef } = this._normalizeTask(taskDefinition);
    this._retainDescriptor(descriptor);

    return new Promise((resolve, reject) => {
      const taskId = this._nextTaskId();

      const job = {
        id: taskId,
        descriptor,
        functionRef,
        args,
        resolve,
        reject
      };

      const worker = this._getAvailableWorker();

      if (worker) {
        this._executeTask(worker, job);
      } else {
        this.tasks.push(job);
      }
    });
  }

  _getAvailableWorker() {
    return this.workers.find(w => !w._busy);
  }

  _executeTask(worker, job) {
    worker._busy = true;
    this.activeJobs.set(job.id, { worker, job });
    
    worker.postMessage({
      id: job.id,
      moduleURL: job.descriptor.moduleURL,
      exportName: job.descriptor.exportName,
      args: job.args
    });
  }

  _handleWorkerResponse(worker, data) {
    worker._busy = false;
    
    const record = this.activeJobs.get(data.id);
    if (!record) return;

    this.activeJobs.delete(data.id);

    const { job } = record;

    if (data.error) {
      job.reject(new Error(data.error));
    } else {
      job.resolve(data.result);
    }

    this._releaseDescriptor(job);

    // Process next task
    if (this.tasks.length > 0) {
      const nextJob = this.tasks.shift();
      this._executeTask(worker, nextJob);
    }
  }

  /**
   * Terminate all workers
   */
  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.activeJobs.forEach(({ job }) => this._releaseDescriptor(job));
    this.activeJobs.clear();
    this.tasks.forEach(job => this._releaseDescriptor(job));
    this.tasks = [];
    this.moduleRegistry.forEach(entry => {
      if (entry?.functionRef && entry.descriptor?.kind === 'function') {
        this._releaseFunctionDescriptor(entry.functionRef, entry.descriptor);
      }
    });
    this.moduleRegistry.clear();
    this.generatedModuleURLs.forEach(url => URL.revokeObjectURL(url));
    this.generatedModuleURLs.clear();
    this.functionModuleCache = new WeakMap();
    this.finalizationRegistry = this._createFinalizationRegistry();
    if (this.workerScriptURL) {
      URL.revokeObjectURL(this.workerScriptURL);
      this.workerScriptURL = null;
    }
  }

  /**
   * Get pool stats
   */
  getStats() {
    return {
      totalWorkers: this.size,
      busyWorkers: this.workers.filter(w => w._busy).length,
      queuedTasks: this.tasks.length,
      activeTasks: this.activeJobs.size
    };
  }

  /**
   * Register reusable task
   */
  registerTask(name, task, exportName = 'default') {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('Task name must be a non-empty string');
    }

    const options = { exportName, persistent: true };
    const normalized = typeof task === 'string'
      ? this._normalizeTask(task, { ...options, expectModulePath: true })
      : this._normalizeTask(task, options);

    const descriptor = normalized.descriptor;
    descriptor.persistent = true;

    this.moduleRegistry.set(name, {
      descriptor,
      functionRef: normalized.functionRef || (typeof task === 'function' ? task : null)
    });

    return name;
  }

  _normalizeTask(task, options = {}) {
    const {
      exportName = 'default',
      persistent = false,
      expectModulePath = false
    } = options;

    if (typeof task === 'string') {
      if (expectModulePath) {
        return {
          descriptor: this._descriptorFromModule(task, exportName, { persistent })
        };
      }

      const entry = this.moduleRegistry.get(task);
      if (!entry) {
        throw new Error(`Worker task "${task}" is not registered`);
      }
      return { descriptor: entry.descriptor, functionRef: entry.functionRef };
    }

    if (typeof task === 'function') {
      const descriptor = this._ensureFunctionDescriptor(task, persistent);
      return { descriptor, functionRef: task };
    }

    if (task && typeof task === 'object') {
      if (task.module) {
        return {
          descriptor: this._descriptorFromModule(
            task.module,
            task.exportName || exportName,
            { persistent }
          )
        };
      }

      if (task.name) {
        return this._normalizeTask(task.name, { exportName, persistent });
      }
    }

    throw new Error('Invalid task. Provide a registered name, function, or { module, exportName }.');
  }

  _nextTaskId() {
    this.taskIdCounter += 1;
    return this.taskIdCounter;
  }

  _retainDescriptor(descriptor) {
    if (!descriptor) return;
    if (typeof descriptor.refCount !== 'number') {
      descriptor.refCount = 0;
    }
    descriptor.refCount += 1;
  }

  _releaseDescriptor(job) {
    const descriptor = job?.descriptor;
    if (!descriptor) return;

    if (typeof descriptor.refCount === 'number' && descriptor.refCount > 0) {
      descriptor.refCount -= 1;
    }

  }

  _ensureFunctionDescriptor(fn, persistent = false) {
    let descriptor = this.functionModuleCache.get(fn);

    if (!descriptor || descriptor.released) {
      const source = `export default ${fn.toString()};`;
      const blob = new Blob([source], { type: 'application/javascript' });
      const moduleURL = URL.createObjectURL(blob);

      descriptor = {
        moduleURL,
        exportName: 'default',
        kind: 'function',
        persistent: !!persistent,
        refCount: 0,
        released: false,
        finalizerToken: {}
      };

      this.functionModuleCache.set(fn, descriptor);
      this.generatedModuleURLs.add(moduleURL);
      if (this.finalizationRegistry && descriptor.finalizerToken) {
        this.finalizationRegistry.register(fn, moduleURL, descriptor.finalizerToken);
      }
    } else if (persistent && !descriptor.persistent) {
      descriptor.persistent = true;
    }

    return descriptor;
  }

  _descriptorFromModule(moduleURL, exportName = 'default', { persistent = true } = {}) {
    if (!moduleURL) {
      throw new Error('Module URL is required for worker task descriptors');
    }

    return {
      moduleURL,
      exportName,
      kind: 'module',
      persistent,
      refCount: 0
    };
  }

  _releaseFunctionDescriptor(fn, descriptor) {
    if (!descriptor || descriptor.released) {
      return;
    }

    if (fn && this.functionModuleCache.has(fn)) {
      this.functionModuleCache.delete(fn);
    }

    if (this.finalizationRegistry && descriptor.finalizerToken) {
      this.finalizationRegistry.unregister(descriptor.finalizerToken);
      descriptor.finalizerToken = null;
    }

    if (descriptor.moduleURL && this.generatedModuleURLs.has(descriptor.moduleURL)) {
      URL.revokeObjectURL(descriptor.moduleURL);
      this.generatedModuleURLs.delete(descriptor.moduleURL);
    }

    descriptor.moduleURL = null;
    descriptor.released = true;
  }

  _createFinalizationRegistry() {
    if (typeof FinalizationRegistry === 'undefined') {
      return null;
    }

    return new FinalizationRegistry((moduleURL) => {
      if (moduleURL && this.generatedModuleURLs.has(moduleURL)) {
        this.generatedModuleURLs.delete(moduleURL);
        URL.revokeObjectURL(moduleURL);
      }
    });
  }
}

/**
 * ScrollScript Worker adapter
 */
export class ScrollScriptWorker {
  constructor(scriptInstance) {
    this.script = scriptInstance;
    this.pool = new WorkerPool();
  }

  registerTask(name, task, exportName) {
    return this.pool.registerTask(name, task, exportName);
  }

  /**
   * Run heavy watcher in worker
   */
  watchInWorker(signalName, computeFn) {
    this.script.watch(signalName, async (value) => {
      try {
        const result = await this.pool.run(computeFn, value);
        console.log('[Worker] Result:', result);
      } catch (error) {
        console.error('[Worker] Error:', error);
      }
    });
  }

  /**
   * Run heavy effect in worker
   */
  async runEffect(fn, ...args) {
    return await this.pool.run(fn, ...args);
  }

  /**
   * Cleanup
   */
  destroy() {
    this.pool.terminate();
  }
}

export const globalWorkerPool = new WorkerPool();

export function createWorkerPool(size) {
  return new WorkerPool(size);
}
