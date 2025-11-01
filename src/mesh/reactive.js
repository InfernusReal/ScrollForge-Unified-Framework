/**
 * ScrollMesh Reactive Components
 * Auto-subscribing, auto-rendering components
 */

import { ScrollMeshCore } from './core.js';
import { globalScheduler } from './scheduler.js';
import { globalDebugger } from './visual-debug.js';

export class ReactiveComponent {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.state = config.state || {};
    this.mounted = false;
    this.element = null;
    this.container = null;
    this.dependencies = new Set();
    this.history = [];
    this.historyIndex = -1;
    this.priority = config.priority || 'normal';
    this._historyLimit = config.historyLimit || 50;
    this._isRestoring = false;
    this._isExternalSync = false;
    this._syncConfig = {};
    this._syncUnsub = [];
    this._queryUnsub = null;
    this.mesh = (typeof window !== 'undefined' && window.app?.Mesh)
      ? window.app.Mesh
      : new ScrollMeshCore();
    
    // Setup
    this._setupState();
    this._setupQuery();
    this._setupSync();
    
    // Register with debugger if debug mode
    if (config.debug) {
      globalDebugger.register(this);
    }
  }

  /**
   * Setup reactive state
   */
  _setupState() {
    const self = this;
    this._stateTarget = this.config.state || {};
    
    // Create proxy for reactivity
    this.state = new Proxy(this._stateTarget, {
      get(target, prop) {
        // Track dependency
        self.dependencies.add(prop);
        return target[prop];
      },
      
      set(target, prop, value) {
        const oldValue = target[prop];
        
        if (oldValue === value) return true;
        
        const shouldTrackHistory = self.config.history && !self._isRestoring && !self._isExternalSync;
        
        target[prop] = value;

        if (self._syncConfig[prop] && !self._isExternalSync) {
          self._pushToSignal(prop, value);
        }

        if (shouldTrackHistory) {
          self._saveHistory();
        }
        
        // Trigger re-render
        if (self.mounted && !self._isRestoring) {
          self._render();
        }
        
        return true;
      }
    });

    if (this.config.history) {
      this._saveHistory();
    }
  }

  /**
   * Setup query system
   */
  _setupQuery() {
    if (!this.config.query) return;
    
    const { from, where, orderBy, limit } = this.config.query;
    
    if (typeof window === 'undefined' || !window.app?.Script) return;

    const applyResults = (data) => {
      if (!Array.isArray(data)) {
        this._isExternalSync = true;
        try {
          this.state.results = [];
        } finally {
          this._isExternalSync = false;
        }
        return;
      }

      let results = data;

      if (where) {
        results = results.filter(where);
      }

      if (orderBy) {
        results = [...results].sort((a, b) => {
          if (a[orderBy] < b[orderBy]) return -1;
          if (a[orderBy] > b[orderBy]) return 1;
          return 0;
        });
      }

      if (limit) {
        results = results.slice(0, limit);
      }

      this._isExternalSync = true;
      try {
        this.state.results = results;
      } finally {
        this._isExternalSync = false;
      }
    };

    const current = window.app.Script.get(from);
    if (current !== undefined) {
      applyResults(current);
    }

    this._queryUnsub = window.app.Script.watch(from, applyResults);
  }

  /**
   * Setup smart sync (bi-directional binding)
   */
  _setupSync() {
    if (!this.config.sync) return;
    if (typeof window === 'undefined' || !window.app?.Script) return;
    
    Object.entries(this.config.sync).forEach(([localProp, globalPath]) => {
      const { signalName, pathParts } = parseSignalPath(globalPath);
      this._syncConfig[localProp] = { signalName, pathParts };

      const unsubscribe = window.app.Script.watch(signalName, (value) => {
        const resolved = resolveValueAtPath(value, pathParts);
        this._applySyncedValue(localProp, resolved);
      });

      this._syncUnsub.push(unsubscribe);

      const current = window.app.Script.get(signalName);
      if (current !== undefined) {
        const resolved = resolveValueAtPath(current, pathParts);
        this._applySyncedValue(localProp, resolved);
      }
    });
  }

  _applySyncedValue(localProp, value) {
    this._isExternalSync = true;
    try {
      this.state[localProp] = value;
    } finally {
      this._isExternalSync = false;
    }
  }

  _pushToSignal(localProp, value) {
    const config = this._syncConfig[localProp];
    if (!config || typeof window === 'undefined' || !window.app?.Script) return;

    const { signalName, pathParts } = config;
    const current = window.app.Script.get(signalName);
    let nextValue;

    if (!pathParts.length) {
      nextValue = value;
    } else {
      const base = cloneData(current ?? {});
      assignValueAtPath(base, pathParts, value);
      nextValue = base;
    }

    this._isExternalSync = true;
    try {
      window.app.Script.set(signalName, nextValue);
    } finally {
      this._isExternalSync = false;
    }
  }

  /**
   * Render component
   */
  _render() {
    if (!this.container) return;
    
    // Time-slicing: Schedule render based on priority
    globalScheduler.schedule(() => {
      if (!this.mounted) return;
      const renderStart = performance.now();
      
      // Clear dependencies before render
      this.dependencies.clear();
      
      // Call render function
      const vdom = this.config.render.call(this, this.state);
      
      // Create DOM element
      this.element = this.mesh._createElementFromSpec(vdom);
      this.container.innerHTML = '';
      this.container.appendChild(this.element);
      
      // Track performance
      const renderTime = performance.now() - renderStart;
      if (this.config.debug) {
        globalDebugger.trackRender(this.name, renderTime);
      }
      
      // Debug mode - show visual state
      if (this.config.debug) {
        this._showVisualDebug();
      }
    }, this.priority);
  }

  /**
   * Show visual debug panel
   */
  _showVisualDebug() {
    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.9);
      color: #0f0;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      max-width: 300px;
      z-index: 10000;
    `;
    
    let stateSummary = '{}';
    try {
      stateSummary = JSON.stringify(this.state, null, 2);
    } catch (error) {
      stateSummary = '[unserializable]';
    }
    
    debugPanel.innerHTML = `
      <div><strong>${this.name}</strong></div>
      <div>State: ${stateSummary}</div>
      <div>Dependencies: ${Array.from(this.dependencies).join(', ')}</div>
      ${this.config.history ? `<div>History: ${this.history.length} snapshots</div>` : ''}
    `;
    
    // Remove old debug panel
    const old = document.querySelector(`[data-debug="${this.name}"]`);
    if (old) old.remove();
    
    debugPanel.setAttribute('data-debug', this.name);
    document.body.appendChild(debugPanel);
  }

  /**
   * Mount component
   */
  mount(container) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    
    if (!this.container) {
      throw new Error('Container not found');
    }
    
    this.mounted = true;
    this._render();
    
    return this;
  }

  /**
   * Unmount component
   */
  unmount() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.mounted = false;
    if (this._queryUnsub) {
      this._queryUnsub();
      this._queryUnsub = null;
    }
    if (this._syncUnsub.length) {
      this._syncUnsub.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this._syncUnsub = [];
    }
    const existingPanel = (typeof document !== 'undefined')
      ? document.querySelector(`[data-debug="${this.name}"]`)
      : null;
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Unregister from debugger
    if (this.config.debug) {
      globalDebugger.unregister(this.name);
    }
  }

  /**
   * Update state
   */
  setState(updates) {
    Object.entries(updates || {}).forEach(([key, value]) => {
      this.state[key] = value;
    });
  }

  /**
   * Save history snapshot
   */
  _saveHistory() {
    const snapshot = cloneData(this._stateTarget);

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(snapshot);
    if (this.history.length > this._historyLimit) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
  }

  _applyHistorySnapshot(snapshot) {
    this._isRestoring = true;
    this._isExternalSync = true;
    try {
      const keys = new Set([
        ...Object.keys(this._stateTarget || {}),
        ...Object.keys(snapshot || {}),
      ]);

      keys.forEach((key) => {
        if (!snapshot || !(key in snapshot)) {
          delete this.state[key];
        } else {
          this.state[key] = snapshot[key];
        }
      });
    } finally {
      this._isExternalSync = false;
      this._isRestoring = false;
    }

    if (this.mounted) {
      this._render();
    }
  }

  /**
   * Undo
   */
  undo() {
    if (!this.config.history) {
      throw new Error('History not enabled for this component');
    }
    
    if (this.historyIndex <= 0) return;

    this.historyIndex -= 1;
    const snapshot = this.history[this.historyIndex];
    this._applyHistorySnapshot(snapshot);
  }

  /**
   * Redo
   */
  redo() {
    if (!this.config.history) {
      throw new Error('History not enabled for this component');
    }
    
    if (this.historyIndex >= this.history.length - 1) return;

    this.historyIndex += 1;
    const snapshot = this.history[this.historyIndex];
    this._applyHistorySnapshot(snapshot);
  }
}

function parseSignalPath(path) {
  if (!path) {
    return { signalName: '', pathParts: [] };
  }

  const parts = path.split('.');
  const [signalName, ...pathParts] = parts;
  return { signalName, pathParts };
}

function resolveValueAtPath(value, pathParts) {
  if (!pathParts.length) return value;
  return pathParts.reduce((acc, part) => {
    if (acc == null) return undefined;
    return acc[part];
  }, value);
}

function assignValueAtPath(target, pathParts, newValue) {
  if (!pathParts.length) {
    return newValue;
  }

  let cursor = target;
  pathParts.forEach((part, index) => {
    if (index === pathParts.length - 1) {
      cursor[part] = newValue;
      return;
    }

    const next = cursor[part];
    let nextContainer;

    if (Array.isArray(next)) {
      nextContainer = [...next];
    } else if (next && typeof next === 'object') {
      nextContainer = { ...next };
    } else {
      nextContainer = {};
    }

    cursor[part] = nextContainer;
    cursor = nextContainer;
  });

  return target;
}

function cloneData(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch (error) {
      // Fallback to JSON clone
    }
  }

  try {
    return JSON.parse(JSON.stringify(value ?? {}));
  } catch (error) {
    return value;
  }
}

