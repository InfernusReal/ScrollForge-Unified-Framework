/**
 * ScrollScript Core Engine
 * Universal data flow orchestration for client and server
 * 
 * Based on Shared Variables Theory:
 * - Global state flags control data flow
 * - Single dispatcher routes all actions
 * - Signals propagate changes reactively
 */

export class ScrollScriptCore {
  constructor(config = {}) {
    this.config = {
      enableTimeTravel: true,
      maxHistorySize: 100,
      batchUpdates: true,
      debugMode: false,
      ...config,
    };

    // Signal storage
    this.signals = new Map();
    this.pipelines = new Map();
    this.actionQueue = [];
    this.currentEpoch = 0;
    this.history = [];
    this.isProcessing = false;
    this.dirtySignals = new Set();

    // Shared Variables Theory - The Core
    this.actionTriggered = false;
    this.actionType = null;
    this.currentScope = 'global';
  }

  /**
   * Create a reactive signal
   */
  signal(name, initialValue, scope = 'global') {
    if (this.signals.has(name)) {
      throw new Error(`Signal "${name}" already exists`);
    }

    const signal = {
      value: initialValue,
      listeners: new Set(),
      epoch: this.currentEpoch,
      scope,
      derived: false,
      dependencies: null,
    };

    this.signals.set(name, signal);

    if (this.config.debugMode) {
      console.log(`[ScrollScript] Signal created: ${name} =`, initialValue);
    }

    return signal;
  }

  /**
   * Create a derived (computed) signal
   */
  derived(name, computeFn, dependencies = [], scope = 'global') {
    const initialValue = computeFn();
    const signal = this.signal(name, initialValue, scope);
    signal.derived = true;
    signal.dependencies = new Set(dependencies);
    signal.compute = computeFn;

    // Subscribe to dependencies
    dependencies.forEach((depName) => {
      this.watch(depName, () => {
        this._recomputeDerived(signal);
      });
    });

    return signal;
  }

  /**
   * Get signal value
   */
  get(name) {
    const signal = this.signals.get(name);
    return signal?.value;
  }

  /**
   * Set signal value (triggers reactivity)
   */
  set(name, value) {
    const signal = this.signals.get(name);
    if (!signal) {
      throw new Error(`Signal "${name}" does not exist`);
    }

    if (signal.derived) {
      throw new Error(`Cannot set derived signal "${name}" directly`);
    }

    const oldValue = signal.value;
    if (oldValue === value) return; // No change

    // Store old value for batched updates
    signal._oldValue = oldValue;
    signal.value = value;
    signal.epoch = ++this.currentEpoch;
    this.dirtySignals.add(signal);

    if (this.config.batchUpdates && !this.isProcessing) {
      this._scheduleBatchUpdate();
    } else {
      this._notifyListeners(signal, oldValue);
      delete signal._oldValue;
    }

    if (this.config.debugMode) {
      console.log(`[ScrollScript] Signal updated: ${name} =`, value);
    }
  }

  /**
   * Watch signal changes
   */
  watch(name, listener) {
    const signal = this.signals.get(name);
    if (!signal) {
      throw new Error(`Signal "${name}" does not exist`);
    }

    signal.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      signal.listeners.delete(listener);
    };
  }

  /**
   * Register action handler (pipeline)
   */
  action(type, handler, options = {}) {
    const pipeline = {
      type,
      handler,
      guard: options.guard,
      transform: options.transform,
      sideEffects: options.sideEffects || [],
    };

    if (!this.pipelines.has(type)) {
      this.pipelines.set(type, []);
    }

    this.pipelines.get(type).push(pipeline);

    if (this.config.debugMode) {
      console.log(`[ScrollScript] Action registered: ${type}`);
    }
  }

  /**
   * Trigger an action (Shared Variables Theory in action!)
   */
  trigger(type, payload = null, scope = null) {
    // Set shared variables
    this.actionTriggered = true;
    this.actionType = type;
    if (scope) this.currentScope = scope;

    const action = {
      type,
      payload,
      scope: scope || this.currentScope,
      timestamp: Date.now(),
    };

    this.actionQueue.push(action);

    if (!this.isProcessing) {
      this._processActions();
    }
  }

  /**
   * Process action queue
   */
  async _processActions() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.actionQueue.length > 0) {
      const action = this.actionQueue.shift();
      await this._dispatchAction(action);
    }

    this.isProcessing = false;
    this._resetActionState();
  }

  /**
   * Dispatch single action through pipelines
   */
  async _dispatchAction(action) {
    const pipelines = this.pipelines.get(action.type);

    if (!pipelines || pipelines.length === 0) {
      if (this.config.debugMode) {
        console.warn(`[ScrollScript] No handler for action: ${action.type}`);
      }
      return;
    }

    if (this.config.debugMode) {
      console.log(`[ScrollScript] Dispatching: ${action.type}`, action.payload);
    }

    // Save frame for time-travel
    if (this.config.enableTimeTravel) {
      this._saveFrame(action);
    }

    for (const pipeline of pipelines) {
      // Guard check
      if (pipeline.guard && !pipeline.guard(action.payload)) {
        continue;
      }

      // Transform payload
      let payload = action.payload;
      if (pipeline.transform) {
        payload = pipeline.transform(payload);
      }

      // Execute handler
      try {
        await pipeline.handler(payload);
      } catch (error) {
        console.error(`[ScrollScript] Error in handler: ${action.type}`, error);
        continue;
      }

      // Execute side effects
      for (const effect of pipeline.sideEffects) {
        try {
          await effect(payload);
        } catch (error) {
          console.error(`[ScrollScript] Error in side effect: ${action.type}`, error);
        }
      }
    }
  }

  /**
   * Reset shared variables (Shared Variables Theory)
   */
  _resetActionState() {
    this.actionTriggered = false;
    this.actionType = null;
  }

  /**
   * Notify signal listeners
   */
  _notifyListeners(signal, oldValue) {
    signal.listeners.forEach((listener) => {
      try {
        listener(signal.value, oldValue);
      } catch (error) {
        console.error('[ScrollScript] Error in listener:', error);
      }
    });
  }

  /**
   * Recompute derived signal
   */
  _recomputeDerived(signal) {
    const oldValue = signal.value;
    const newValue = signal.compute();

    if (oldValue !== newValue) {
      signal.value = newValue;
      signal.epoch = ++this.currentEpoch;
      this.dirtySignals.add(signal);
      this._notifyListeners(signal, oldValue);
    }
  }

  /**
   * Schedule batched update (microtask)
   */
  _scheduleBatchUpdate() {
    queueMicrotask(() => {
      this._flushBatchedUpdates();
    });
  }

  /**
   * Flush all batched updates
   */
  _flushBatchedUpdates() {
    const dirtySignals = Array.from(this.dirtySignals);
    this.dirtySignals.clear();

    dirtySignals.forEach((signal) => {
      // Store old value before notifying
      const oldValue = signal._oldValue !== undefined ? signal._oldValue : signal.value;
      const newValue = signal.value;
      
      signal.listeners.forEach((listener) => {
        try {
          listener(newValue, oldValue);
        } catch (error) {
          console.error('[ScrollScript] Error in batched listener:', error);
        }
      });
      
      // Clear old value after notification
      delete signal._oldValue;
    });
  }

  /**
   * Save frame for time-travel
   */
  _saveFrame(action) {
    const frame = {
      epoch: this.currentEpoch,
      actions: [action],
      signals: new Map(
        Array.from(this.signals.entries()).map(([name, signal]) => [name, signal.value])
      ),
      timestamp: Date.now(),
    };

    this.history.push(frame);

    // Limit history size
    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Time-travel to specific epoch
   */
  jumpTo(epoch) {
    if (!this.config.enableTimeTravel) {
      throw new Error('Time-travel is not enabled');
    }

    const frame = this.history.find((f) => f.epoch === epoch);
    if (!frame) {
      throw new Error(`Frame with epoch ${epoch} not found`);
    }

    // Restore signals
    frame.signals.forEach((value, name) => {
      const signal = this.signals.get(name);
      if (signal && !signal.derived) {
        signal.value = value;
        signal.epoch = epoch;
      }
    });

    this.currentEpoch = epoch;

    if (this.config.debugMode) {
      console.log(`[ScrollScript] Jumped to epoch ${epoch}`);
    }
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.history.length < 2) return;
    const previousFrame = this.history[this.history.length - 2];
    this.jumpTo(previousFrame.epoch);
  }

  /**
   * Get all signals (for debugging)
   */
  getAllSignals() {
    return new Map(this.signals);
  }

  /**
   * Get history (for debugging)
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Reset everything
   */
  reset() {
    this.signals.clear();
    this.pipelines.clear();
    this.actionQueue = [];
    this.history = [];
    this.currentEpoch = 0;
    this.dirtySignals.clear();
    this._resetActionState();
  }
}

