/**
 * ScrollScript Client Runtime
 * Browser-specific extensions for ScrollScript
 */

import { ScrollScriptCore } from './core.js';
import { createForgeFetch } from './forge-fetch.js';
import { createNetHub } from './net-hub.js';
import { createRequestHelper } from '../mesh/request-helpers.js';

export class ScrollScriptClient extends ScrollScriptCore {
  constructor(config = {}) {
    super(config);
    this.eventListeners = new Map();
    this.domObservers = [];
    
    // Advanced HTTP client
    this.fetch = createForgeFetch(this);
    
    // Network hub
    this.net = createNetHub(this, this.fetch);
    
    // Request helpers for Mesh
    this.request = createRequestHelper(this.fetch);
    
    this._initializeClient();
  }

  /**
   * Initialize client-specific features
   */
  _initializeClient() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  /**
   * Bind DOM event to action
   */
  on(selector, event, actionType, payloadExtractor = null) {
    const elements =
      typeof selector === 'string'
        ? Array.from(document.querySelectorAll(selector))
        : [selector];

    const handler = (e) => {
      if (payloadExtractor) {
        const payload = payloadExtractor(e);
        // Only trigger if extractor returns a value (not undefined)
        if (payload !== undefined) {
          this.trigger(actionType, payload);
        }
      } else {
        this.trigger(actionType, undefined);
      }
    };

    elements.forEach((el) => {
      el.addEventListener(event, handler);
    });

    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add({ elements, handler });

    // Return cleanup function
    return () => {
      elements.forEach((el) => {
        el.removeEventListener(event, handler);
      });
    };
  }

  /**
   * Keyboard event helper
   */
  onKey(key, actionType, payload = null) {
    const handler = (e) => {
      if (e.key === key) {
        e.preventDefault();
        const actualPayload = payload || { key: e.key, code: e.code };
        this.trigger(actionType, actualPayload);
      }
    };

    document.body.addEventListener('keydown', handler);

    if (!this.eventListeners.has('keydown')) {
      this.eventListeners.set('keydown', new Set());
    }
    this.eventListeners.get('keydown').add({ elements: [document.body], handler });

    return () => {
      document.body.removeEventListener('keydown', handler);
    };
  }

  /**
   * Arrow key navigation helper
   */
  onArrowKeys(handlers) {
    const keyMap = {
      ArrowUp: handlers.up,
      ArrowDown: handlers.down,
      ArrowLeft: handlers.left,
      ArrowRight: handlers.right,
    };

    return this.on(document.body, 'keydown', 'ARROW_KEY', (e) => {
      const actionType = keyMap[e.key];
      if (actionType) {
        e.preventDefault();
        this.trigger(actionType);
      }
    });
  }

  /**
   * Scroll event helper with throttling
   */
  onScroll(actionType, throttle = 100) {
    let lastCall = 0;

    const handler = () => {
      const now = Date.now();
      if (now - lastCall >= throttle) {
        lastCall = now;
        this.trigger(actionType, {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          scrollHeight: document.documentElement.scrollHeight,
          clientHeight: document.documentElement.clientHeight,
          scrollPercent: (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
        });
      }
    };

    window.addEventListener('scroll', handler);

    return () => {
      window.removeEventListener('scroll', handler);
    };
  }

  /**
   * Mouse/Touch position tracker
   */
  onPointer(actionType, throttle = 16) {
    let lastCall = 0;

    const handler = (e) => {
      const now = Date.now();
      if (now - lastCall < throttle) return;
      lastCall = now;

      let x, y;

      if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      }

      if (x !== undefined && y !== undefined) {
        this.trigger(actionType, { x, y });
      }
    };

    document.addEventListener('mousemove', handler);
    document.addEventListener('touchmove', handler);

    return () => {
      document.removeEventListener('mousemove', handler);
      document.removeEventListener('touchmove', handler);
    };
  }

  /**
   * Click handler
   */
  onClick(selector, actionType, payloadExtractor = null) {
    return this.on(selector, 'click', actionType, payloadExtractor);
  }

  /**
   * Form submit handler
   */
  onSubmit(selector, actionType) {
    return this.on(selector, 'submit', actionType, (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      return Object.fromEntries(formData.entries());
    });
  }

  /**
   * Input change handler
   */
  onInput(selector, actionType) {
    return this.on(selector, 'input', actionType, (e) => ({
      value: e.target.value,
      name: e.target.name,
    }));
  }

  /**
   * Observe DOM mutations
   */
  observe(selector, actionType, options = { childList: true, subtree: true }) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    const observer = new MutationObserver((mutations) => {
      this.trigger(actionType, { mutations });
    });

    observer.observe(element, options);
    this.domObservers.push(observer);

    return () => {
      observer.disconnect();
      const index = this.domObservers.indexOf(observer);
      if (index > -1) {
        this.domObservers.splice(index, 1);
      }
    };
  }

  /**
   * Debounce helper
   */
  debounce(actionType, delay) {
    let timeout = null;

    return (payload = null) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.trigger(actionType, payload);
      }, delay);
    };
  }

  /**
   * Throttle helper
   */
  throttle(actionType, delay) {
    let lastCall = 0;

    return (payload = null) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        this.trigger(actionType, payload);
      }
    };
  }

  /**
   * Persist signal to localStorage
   */
  persist(signalName, storageKey = null) {
    const key = storageKey || `scrollscript_${signalName}`;

    // Load from localStorage
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const value = JSON.parse(stored);
        this.set(signalName, value);
      } catch (error) {
        console.error(`[ScrollScript] Failed to parse stored value for ${signalName}`);
      }
    }

    // Watch for changes and save
    this.watch(signalName, (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`[ScrollScript] Failed to persist ${signalName}`);
      }
    });
  }

  /**
   * Sync signal across tabs
   */
  sync(signalName) {
    const key = `scrollscript_sync_${signalName}`;

    // Listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === key && e.newValue) {
        try {
          const value = JSON.parse(e.newValue);
          this.set(signalName, value);
        } catch (error) {
          console.error(`[ScrollScript] Failed to sync ${signalName}`);
        }
      }
    });

    // Broadcast changes to other tabs
    this.watch(signalName, (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`[ScrollScript] Failed to broadcast ${signalName}`);
      }
    });
  }

  /**
   * Request animation frame loop
   */
  onFrame(actionType) {
    let rafId;
    let running = true;

    const loop = (timestamp) => {
      if (!running) return;
      this.trigger(actionType, { timestamp, delta: timestamp - (loop.lastTime || timestamp) });
      loop.lastTime = timestamp;
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
  }

  /**
   * Intersection Observer helper
   */
  onIntersect(selector, actionType, options = {}) {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.trigger(actionType, {
          isIntersecting: entry.isIntersecting,
          ratio: entry.intersectionRatio,
          element: entry.target,
        });
      });
    }, options);

    elements.forEach((el) => observer.observe(el));

    // Store observer for cleanup
    this.domObservers.push(observer);

    return () => {
      observer.disconnect();
      const index = this.domObservers.indexOf(observer);
      if (index > -1) {
        this.domObservers.splice(index, 1);
      }
    };
  }

  /**
   * Cleanup all client resources
   */
  cleanup() {
    // Remove all event listeners with correct event names
    this.eventListeners.forEach((listeners, eventName) => {
      listeners.forEach(({ elements, handler }) => {
        elements.forEach((el) => {
          el.removeEventListener(eventName, handler);
        });
      });
    });
    this.eventListeners.clear();

    // Disconnect all observers
    this.domObservers.forEach((observer) => observer.disconnect());
    this.domObservers = [];

    // Reset core
    this.reset();
  }
}

