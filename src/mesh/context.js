import { ScrollMeshCore } from './core.js';

const PROXY_FLAG = Symbol('ScrollMeshProxy');

/**
 * ScrollMesh Context System
 * Auto-wiring system for unlimited functions
 * 
 * Usage:
 * ScrollMesh(fn1, fn2, fn3, ...) - Pass any number of functions
 * They all auto-connect and share reactive context
 */
export class ScrollMeshContext {
  constructor(...functions) {
    this.functions = functions;
    this.state = {};
    this.computed = {};
    this.selectors = {};
    this.middleware = {};
    this.validators = {};
    this.listeners = new Map();
    this.snapshots = [];
    this.mounted = false;
    this.element = null;
    this.container = null;
    this.mesh = new ScrollMeshCore();
    this._stateTarget = {};
    this._proxyCache = new WeakSet();
    this._stateVersion = 0;
    this.historyLimit = 50;
    this._isRestoring = false;
    this._stateFunction = null;
    this._syncInitialSnapshot = null;
    
    // Context objects passed to functions
    this.contexts = {
      state: null,      // Reactive state proxy
      events: null,     // Event system
      effects: null,    // Side effects
      animate: null,    // Animations
      api: null,        // API calls
      storage: null,    // Persistence
      validate: null,   // Validation
      analytics: null,  // Analytics
    };
    
    this._initialize();
  }

  /**
   * Initialize the context
   */
  _initialize() {
    // Extract state function (prefer zero-argument functions)
    const stateFn = [...this.functions]
      .reverse()
      .find((fn) => fn.length === 0);

    let initialState = {};

    if (stateFn) {
      this._stateFunction = stateFn;
      this.functions = this.functions.filter((fn) => fn !== stateFn);

      const produced = stateFn();
      const looksLikeRenderable =
        produced &&
        typeof produced === 'object' &&
        (typeof produced.tag === 'string' || Array.isArray(produced.children));

      if (produced && typeof produced === 'object' && !looksLikeRenderable) {
        initialState = produced;
      } else {
        // Treat as non-state function (likely UI) and restore it
        this._stateFunction = null;
        this.functions.push(stateFn);
      }
    }

    this._setupState(initialState);

    const uiIndex = this.functions.findIndex((fn) => {
      const params = getParameterTokens(fn);
      if (params.length === 0) return false;
      const first = params[0];
      if (!first) return false;
      const token = first.replace(/=.*$/, '').replace(/^\.{3}/, '').trim();
      if (!token) return false;
      if (first.trim().startsWith('{') || first.trim().startsWith('[')) {
        return true;
      }
      const lowered = token.toLowerCase();
      return ['state', 'props', 'data'].includes(lowered);
    });

    if (uiIndex !== -1) {
      this._uiFunction = this.functions[uiIndex];
      this.functions.splice(uiIndex, 1);
    } else {
      this._uiFunction = null;
    }

    // Setup all context objects
    this._setupContexts();
    
    // Execute all functions with their contexts
    this._executeFunctions();
  }

  /**
   * Setup reactive state with Proxy
   */
  _setupState(initialState) {
    // Extract special properties
    const { computed, selectors, middleware, validate, immutable, debug, ...plainState } = initialState;

    this.computed = computed || {};
    this.selectors = selectors || {};
    this.middleware = middleware || {};
    this.validators = validate || {};
    this.immutable = immutable || false;
    this.debug = debug || {};
    this.historyLimit = this.debug.historyLimit || this.historyLimit;
    this._stateTarget = plainState;
    this._computedCache = new Map();
    this._selectorCache = new Map();

    // Create reactive proxy
    this.state = this._createProxy(plainState);
    this.contexts.state = this.state;
    
    // Setup computed properties
    this._setupComputed();
    
    // Setup selectors
    this._setupSelectors();

    this._recordSnapshot();
  }

  /**
   * Create reactive proxy for state
   */
  _createProxy(target, path = []) {
    const self = this;
    
    const proxy = new Proxy(target, {
      get(obj, prop) {
        const value = obj[prop];
        
        if (self.computed[prop]) {
          const cached = self._computedCache.get(prop);
          if (!cached || cached.version !== self._stateVersion) {
            const computedValue = self.computed[prop](self.state);
            self._computedCache.set(prop, { version: self._stateVersion, value: computedValue });
            return computedValue;
          }
          return cached.value;
        }
        
        if (self.selectors[prop]) {
          const cache = self._selectorCache.get(prop);
          if (!cache || cache.version !== self._stateVersion) {
            const selectorValue = self.selectors[prop](self.state);
            self._selectorCache.set(prop, { version: self._stateVersion, value: selectorValue });
            return selectorValue;
          }
          return cache.value;
        }
        
        if (value && typeof value === 'object') {
          if (value && value[PROXY_FLAG]) {
            return value;
          }
          return self._createProxy(value, [...path, prop]);
        }
        
        return value;
      },
      
      set(obj, prop, value) {
        // Skip Symbol properties (like PROXY_FLAG)
        if (typeof prop === 'symbol') {
          obj[prop] = value;
          return true;
        }
        
        const isTopLevel = path.length === 0;
        if (self.immutable && !isTopLevel) {
          throw new Error(`Cannot mutate immutable state: ${[...path, prop].join('.')}`);
        }
        
        const oldValue = obj[prop];
        const fullPath = [...path, prop].join('.');
        
        if (self.middleware[fullPath]) {
          value = self.middleware[fullPath](oldValue, value);
        } else if (self.middleware[prop]) {
          value = self.middleware[prop](oldValue, value);
        }
        
        const validator = self.validators[fullPath] || self.validators[prop];
        if (validator) {
          const error = validator(value);
          if (error !== true && error) {
            console.error(`Validation failed for ${prop}: ${error}`);
            if (self.debug.throwOnValidation) {
              throw new Error(error);
            }
            return false;
          }
        }
        
        if (value && typeof value === 'object' && !value[PROXY_FLAG]) {
          value = self._createProxy(value, [...path, prop]);
        }
        
        if (self.debug.logChanges) {
          console.log(`[State] ${fullPath} changed:`, oldValue, '->', value);
        }
        
        if (self.debug.breakOnChange?.includes(prop)) {
          debugger;
        }
        
        if (!self._isRestoring) {
          self._recordSnapshot();
        }
        
        obj[prop] = value;
        self._stateVersion += 1;
        self._computedCache.clear();
        self._selectorCache.clear();
        
        self._notifyChange(fullPath, value, oldValue);
        
        if (self.mounted) {
          self._render();
        }
        
        return true;
      },

      deleteProperty(obj, prop) {
        const isTopLevel = path.length === 0;
        if (self.immutable && !isTopLevel) {
          throw new Error(`Cannot mutate immutable state: ${[...path, prop].join('.')}`);
        }

        if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
          return true;
        }

        if (!self._isRestoring) {
          self._recordSnapshot();
        }

        const fullPath = [...path, prop].join('.');
        const oldValue = obj[prop];
        delete obj[prop];

        self._stateVersion += 1;
        self._computedCache.clear();
        self._selectorCache.clear();
        self._notifyChange(fullPath, undefined, oldValue);

        if (self.mounted) {
          self._render();
        }

        return true;
      }
    });

    proxy[PROXY_FLAG] = true;
    this._proxyCache.add(proxy);
    return proxy;
  }

  /**
   * Setup computed properties
   */
  _setupComputed() {
    this._computedCache.clear();
  }

  /**
   * Setup selectors (memoized)
   */
  _setupSelectors() {
    this._selectorCache.clear();
    Object.keys(this.selectors).forEach((key) => {
      this._selectorCache.set(key, { version: -1, value: undefined });
    });
  }

  _createSnapshot() {
    const source = this._stateTarget;
    if (typeof structuredClone === 'function') {
      try {
        return structuredClone(source);
      } catch (error) {
        // Fall back to JSON cloning below
      }
    }
    return JSON.parse(JSON.stringify(source));
  }

  _recordSnapshot() {
    if (this._isRestoring) return;
    const snapshot = this._createSnapshot();
    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.historyLimit) {
      this.snapshots.shift();
    }
  }

  /**
   * Setup all context objects
   */
  _setupContexts() {
    const self = this;
    this.contexts.state = this.state;
    
    // Events context
    this.contexts.events = {
      on: (eventName, handler) => {
        if (!self.listeners.has(eventName)) {
          self.listeners.set(eventName, new Set());
        }
        self.listeners.get(eventName).add(handler);
      },
      
      emit: (eventName, data) => {
        const handlers = self.listeners.get(eventName);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      },
      
      off: (eventName, handler) => {
        const handlers = self.listeners.get(eventName);
        if (handlers) {
          handlers.delete(handler);
        }
      }
    };
    
    // Effects context
    this.contexts.effects = {
      when: (statePath, callback) => {
        self._watch(statePath, callback);
      },
      
      once: (statePath, callback) => {
        const unwatch = self._watch(statePath, (value) => {
          callback(value);
          unwatch();
        });
      }
    };
    
    // Animate context
    this.contexts.animate = {
      when: (statePath, callback) => {
        self._watch(statePath, callback);
      },
      
      spring: (selector, styles) => {
        // Integrate with ScrollWeave
        if (typeof window !== 'undefined' && window.app?.Weave) {
          window.app.Weave.spring(selector, styles);
        }
      }
    };
    
    // API context
    this.contexts.api = {
      when: (statePath, callback) => {
        self._watch(statePath, callback);
      },
      
      fetch: async (url, options) => {
        return await fetch(url, options);
      }
    };
    
    // Storage context
    this.contexts.storage = {
      persist: (key, value) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(value));
        }
      },
      
      load: async (key) => {
        if (typeof localStorage !== 'undefined') {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        }
        return null;
      }
    };
    
    // Validate context
    this.contexts.validate = {
      rule: (field, validator, message) => {
        self.validators[field] = (value) => {
          return validator(value) || message;
        };
      }
    };
    
    // Analytics context
    this.contexts.analytics = {
      track: (event, getValue) => {
        // Simple analytics tracking
        console.log(`[Analytics] ${event}:`, getValue());
      }
    };
  }

  /**
   * Execute all functions with appropriate contexts
   */
  _executeFunctions() {
    this.functions.forEach((fn, index) => {
      const params = getParameterTokens(fn);
      if (params.length === 0) {
        try {
          fn();
        } catch (error) {
          console.error(`Error executing function ${index}:`, error);
        }
        return;
      }

      const args = params
        .map((token) => mapTokenToContext(token, this.state, this.contexts))
        .filter((arg) => arg !== undefined);
      
      try {
        fn(...args);
      } catch (error) {
        console.error(`Error executing function ${index}:`, error);
      }
    });
  }

  /**
   * Watch state changes
   */
  _watch(path, callback) {
    const key = `watch_${path}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    return () => {
      this.listeners.get(key).delete(callback);
    };
  }

  /**
   * Notify change listeners
   */
  _notifyChange(path, newValue, oldValue) {
    const key = `watch_${path}`;
    const handlers = this.listeners.get(key);
    if (handlers) {
      handlers.forEach(handler => handler(newValue, oldValue));
    }
  }

  /**
   * Render UI
   */
  _render() {
    if (!this.container || !this._uiFunction) return;

    const params = getParameterTokens(this._uiFunction);
    const args = params.length
      ? params.map((token) => mapTokenToContext(token, this.state, this.contexts))
      : [this.state];

    const vdom = this._uiFunction(...args);

    this.element = this.mesh._createElementFromSpec(vdom);
    this.container.innerHTML = '';
    this.container.appendChild(this.element);
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
    this.listeners.clear();
  }

  /**
   * Create snapshot of current state
   */
  snapshot() {
    return this._createSnapshot();
  }

  /**
   * Restore state from snapshot
   */
  restore(snapshot) {
    this._isRestoring = true;
    try {
      const keys = new Set([
        ...Object.keys(this._stateTarget),
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
      this._isRestoring = false;
    }

    if (this.mounted) {
      this._render();
    }
  }

  /**
   * Transaction - atomic state updates
   */
  transaction(fn) {
    const snapshot = this._createSnapshot();
    
    try {
      fn();
    } catch (error) {
      // Rollback on error
      this.restore(snapshot);
      throw error;
    }
  }

  /**
   * Undo last change
   */
  undo() {
    if (this.snapshots.length <= 1) return;
    this.snapshots.pop(); // drop current
    const previous = this.snapshots[this.snapshots.length - 1];
    this.restore(previous);
  }
}

/**
 * ScrollMesh function - create context with unlimited functions
 */
export function ScrollMesh(...functions) {
  return new ScrollMeshContext(...functions);
}


function getParameterTokens(fn) {
  const stringified = fn
    .toString()
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  const arrowMatch = stringified.match(/^\s*(?:async\s*)?(?:\(([^)]*)\)|([^=\s]+))\s*=>/);
  if (arrowMatch) {
    const params = arrowMatch[1] ?? arrowMatch[2];
    return params ? splitParams(params) : [];
  }

  const funcMatch = stringified.match(/^\s*(?:async\s*)?function[^(]*\(([^)]*)\)/);
  if (funcMatch) {
    return splitParams(funcMatch[1] || '');
  }

  return [];
}

function splitParams(paramString) {
  if (!paramString || !paramString.trim()) return [];
  return paramString
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
}

function mapTokenToContext(token, state, contexts) {
  if (!token) return undefined;

  const trimmed = token.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return state;
  }

  const clean = trimmed.replace(/=.*$/, '').replace(/^\.{3}/, '').trim();
  if (!clean) return undefined;

  const lower = clean.toLowerCase();

  if (lower === 'context' || lower === 'ctx') {
    return contexts;
  }

  if (clean in contexts) {
    return contexts[clean];
  }

  if (['state', 'props', 'data'].includes(lower)) {
    return state;
  }

  return undefined;
}
