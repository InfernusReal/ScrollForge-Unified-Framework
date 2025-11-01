/**
 * ScrollMesh HTML Context
 * Extended context system with HTML template support
 */

import { ScrollMeshContext } from './context.js';
import { globalParser } from './html-parser.js';

export class HTMLScrollMeshContext extends ScrollMeshContext {
  constructor(...functions) {
    const { pipeline, htmlFunction, weaveFunction } = HTMLScrollMeshContext._partitionFunctions(functions);
    super(...pipeline);
    this.htmlFunction = htmlFunction;
    this.weaveFunction = weaveFunction;
    this.htmlContainer = null;
  }

  /**
   * Override context setup to add event/weave support
   */
  _setupContexts() {
    super._setupContexts();
    this._wrapEventContext();
    this._setupWeaveContext();
  }

  /**
   * Wrap events context to support DOM delegation
   */
  _wrapEventContext() {
    const baseEvents = this.contexts.events;
    const domHandlers = this._domHandlers = this._domHandlers || new Map();
    this._domDelegates = this._domDelegates || new Map();
    const self = this;

    this.contexts.events = {
      on(eventName, selectorOrHandler, maybeHandler) {
        if (typeof selectorOrHandler === 'string' && typeof maybeHandler === 'function') {
          if (!domHandlers.has(eventName)) {
            domHandlers.set(eventName, []);
          }
          domHandlers.get(eventName).push({ selector: selectorOrHandler, handler: maybeHandler });
          self._attachDelegates();
        } else if (typeof selectorOrHandler === 'function' && maybeHandler === undefined) {
          baseEvents.on(eventName, selectorOrHandler);
        } else {
          throw new Error('events.on expects (event, handler) or (event, selector, handler)');
        }
      },

      off(eventName, selectorOrHandler, maybeHandler) {
        if (typeof selectorOrHandler === 'string' && typeof maybeHandler === 'function') {
          if (!domHandlers.has(eventName)) return;
          const filtered = domHandlers
            .get(eventName)
            .filter(({ selector, handler }) => !(selector === selectorOrHandler && handler === maybeHandler));
          if (filtered.length === 0) {
            domHandlers.delete(eventName);
            self._detachDelegate(eventName);
          } else {
            domHandlers.set(eventName, filtered);
          }
        } else if (typeof selectorOrHandler === 'function' && maybeHandler === undefined) {
          baseEvents.off(eventName, selectorOrHandler);
        }
      },

      emit: (...args) => baseEvents.emit(...args),
    };
  }

  /**
   * Setup Weave context
   */
  _setupWeaveContext() {
    const weave = this._getWeaveAdapter();
    const noop = () => {};

    this.contexts.weave = {
      apply: weave ? weave.apply.bind(weave) : noop,
      when: weave ? weave.when.bind(weave) : noop,
      animate: weave ? weave.animate?.bind(weave) ?? noop : noop,
      spring: weave ? weave.spring?.bind(weave) ?? noop : noop,
      fadeIn: weave ? weave.fadeIn?.bind(weave) ?? noop : noop,
      fadeOut: weave ? weave.fadeOut?.bind(weave) ?? noop : noop,
      on: (selector, event, styles) => {
        if (typeof document === 'undefined') return;
        this.contexts.events.on(event, selector, (ev) => {
          const target = ev.target.closest(selector);
          if (!target) return;
          Object.entries(styles).forEach(([prop, value]) => {
            target.style[prop] = value;
          });
        });
      },
    };
  }

  _getWeaveAdapter() {
    if (this.weaveAdapter) return this.weaveAdapter;
    if (typeof window !== 'undefined' && window.app?.Weave) {
      return window.app.Weave;
    }
    return null;
  }

  /**
   * Attach delegated DOM listeners based on registered handlers
   */
  _attachDelegates() {
    if (!this.htmlContainer || !this._domHandlers || this._domHandlers.size === 0) return;

    this._domHandlers.forEach((handlers, eventName) => {
      if (!this._domDelegates.has(eventName)) {
        const listener = (event) => {
          const handlersForEvent = this._domHandlers.get(eventName);
          if (!handlersForEvent || handlersForEvent.length === 0) {
            return;
          }

          handlersForEvent.forEach(({ selector, handler }) => {
            const match = event.target.closest(selector);
            if (match && this.htmlContainer.contains(match)) {
              try {
                handler.call(match, event, this.state);
              } catch (error) {
                console.error('[HTMLScrollMesh] Event handler failed:', error);
              }
            }
          });
        };

        this.htmlContainer.addEventListener(eventName, listener);
        this._domDelegates.set(eventName, listener);
      }
    });
  }

  _detachDelegate(eventName) {
    if (!this.htmlContainer || !this._domDelegates) return;
    const listener = this._domDelegates.get(eventName);
    if (listener) {
      this.htmlContainer.removeEventListener(eventName, listener);
      this._domDelegates.delete(eventName);
    }
  }

  _removeDelegates() {
    if (!this.htmlContainer || !this._domDelegates) return;
    this._domDelegates.forEach((listener, eventName) => {
      this.htmlContainer.removeEventListener(eventName, listener);
    });
    this._domDelegates.clear();
  }

  /**
   * Override render to support HTML
   */
  _render() {
    if (!this.container) return;

    if (this.htmlFunction) {
      this._renderFromHTML();
    } else if (this._uiFunction) {
      this._renderFromJS();
    }

    if (this.weaveFunction && this.mounted) {
      const weave = this.contexts.weave;
      setTimeout(() => {
        try {
          this.weaveFunction(this.state, weave);
        } catch (error) {
          console.error('[HTMLScrollMesh] Weave function error:', error);
        }
      }, 0);
    }
  }

  /**
   * Render from HTML template function
   */
  _renderFromHTML() {
    const htmlString = this.htmlFunction(this.state, this.contexts);
    const element = globalParser.parseTemplate(htmlString, this.state);
    this._stripInlineHandlers(element);

    this.container.innerHTML = '';
    this.container.appendChild(element);

    this.element = this.container.firstElementChild || element;
    this.htmlContainer = this.container;
    this._attachDelegates();
  }

  /**
   * Render from JavaScript object (fallback to base behaviour)
   */
  _renderFromJS() {
    super._render();
  }

  /**
   * Ensure DOM listeners are removed when unmounted
   */
  unmount() {
    this._removeDelegates();
    this.htmlContainer = null;
    super.unmount();
  }

  _stripInlineHandlers(root) {
    if (!root) return;

    const elements = [];
    if (root.nodeType === 1) {
      elements.push(root);
    }
    elements.push(...root.querySelectorAll?.('*') ?? []);

    elements.forEach((el) => {
      const attrs = Array.from(el.attributes || []);
      attrs.forEach((attr) => {
        if (/^on/i.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }

  static _partitionFunctions(functions) {
    let htmlFunction = null;
    let weaveFunction = null;
    const pipeline = [];

    const isHtmlFunction = (fn) => {
      if (typeof fn !== 'function') return false;
      const str = fn.toString();
      return str.includes('`') && /<\w+/.test(str);
    };

    const getParams = (fn) => {
      const str = fn.toString();
      const match = str.match(/\(([^)]*)\)/) || str.match(/([^=]+)=>/);
      if (!match) return [];
      const params = match[1] || match[0];
      return params.split(',').map((p) => p.trim());
    };

    functions.forEach((fn) => {
      if (!htmlFunction && isHtmlFunction(fn)) {
        htmlFunction = fn;
        return;
      }

      if (!weaveFunction && typeof fn === 'function') {
        const params = getParams(fn);
        if (params.some((p) => p.includes('weave'))) {
          weaveFunction = fn;
          return;
        }
      }

      pipeline.push(fn);
    });

    return { pipeline, htmlFunction, weaveFunction };
  }
}

/**
 * Enhanced ScrollMesh function with HTML support
 */
export function HTMLScrollMesh(...functions) {
  const renderHelpers = functions.filter(
    (fn) => typeof fn === 'function' && fn._isRenderer
  );
  const remainingFunctions = functions.filter(
    (fn) => !(typeof fn === 'function' && fn._isRenderer)
  );

  const context = new HTMLScrollMeshContext(...remainingFunctions);

  renderHelpers.forEach((helper) => {
    try {
      helper(context);
    } catch (error) {
      console.error('[HTMLScrollMesh] Render helper failed:', error);
    }
  });

  return context;
}

/**
 * Predefined render helper
 */
HTMLScrollMesh.render = function (selector) {
  function renderHelper(instance) {
    if (instance && typeof instance.mount === 'function') {
      instance.mount(selector);
    }
  }
  renderHelper._isRenderer = true;
  renderHelper.selector = selector;
  return renderHelper;
};
