/**
 * ScrollMesh Core Engine
 * Recursive component assembly with connector topology
 * 
 * "Messy backend, clean frontend"
 * Chaos lives inside, clean facade outside
 */

export class ScrollMeshCore {
  constructor(config = {}) {
    this.config = {
      debugMode: false,
      virtualizeThreshold: 100,
      ...config,
    };

    this.blueprints = new Map();
    this.instances = new Map();
    this.connectors = new Map();
    this.mountedComponents = new WeakMap();
  }

  /**
   * Register a blueprint (component definition)
   */
  blueprint(name, definition) {
    this.blueprints.set(name, definition);

    if (this.config.debugMode) {
      console.log(`[ScrollMesh] Blueprint registered: ${name}`);
    }

    return definition;
  }

  /**
   * Create a component instance
   */
  create(name, props = {}, children = []) {
    const blueprint = this.blueprints.get(name);
    
    if (!blueprint) {
      throw new Error(`Blueprint "${name}" not found`);
    }

    const instance = {
      id: this._generateId(),
      name,
      props,
      children,
      blueprint,
      element: null,
      mounted: false,
    };

    this.instances.set(instance.id, instance);

    return instance;
  }

  /**
   * Render component to DOM
   */
  render(component, container) {
    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      throw new Error('Container not found');
    }

    const { element, instance } = this._renderNode(component);
    
    // Clear container and append
    containerEl.innerHTML = '';
    containerEl.appendChild(element);

    // Mark as mounted when rendering a component instance
    if (instance) {
      instance.element = element;
      instance.mounted = true;
      this.mountedComponents.set(element, instance);
    }

    if (this.config.debugMode) {
      const name = instance?.name || component?.name || component?.tag || 'anonymous';
      console.log(`[ScrollMesh] Rendered: ${name}`);
    }

    return element;
  }

  /**
   * Render component recursively
   */
  _renderComponent(component) {
    const { blueprint, props, children } = component;

    // If blueprint is a function, call it
    if (typeof blueprint === 'function') {
      const result = blueprint(props, children);
      return this._createElementFromSpec(result);
    }

    // If blueprint is an object spec
    if (typeof blueprint === 'object') {
      return this._createElementFromSpec(blueprint, props, children);
    }

    throw new Error('Invalid blueprint type');
  }

  /**
   * Resolve any node (component instance, blueprint spec, array, etc.) to DOM output
   */
  _renderNode(node) {
    if (node?.blueprint) {
      return {
        element: this._renderComponent(node),
        instance: node,
      };
    }

    if (node && this.blueprints.has(node.name) && typeof node.blueprint !== 'function') {
      // Handle case where a stored instance reference is passed through
      return {
        element: this._renderComponent(node),
        instance: node,
      };
    }

    const element = this._createElementFromSpec(node);
    return { element, instance: null };
  }

  /**
   * Create DOM element from specification
   */
  _createElementFromSpec(spec, _props = {}, children = []) {
    // Handle string (text node)
    if (typeof spec === 'string') {
      return document.createTextNode(spec);
    }

    // Handle null/undefined
    if (spec == null) {
      return document.createDocumentFragment();
    }

    // Handle array (multiple elements)
    if (Array.isArray(spec)) {
      const fragment = document.createDocumentFragment();
      spec.forEach((child) => {
        fragment.appendChild(this._createElementFromSpec(child));
      });
      return fragment;
    }

    // Handle component spec
    const {
      tag = 'div',
      attrs = {},
      style = {},
      events = {},
      content = '',
      children: specChildren = [],
    } = spec;

    // Create element
    const el = document.createElement(tag);

    // Apply only valid HTML attributes (not component props)
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'class') {
        el.className = value;
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        el.setAttribute(key, value);
      }
      // Skip non-primitive values (objects, functions, etc.) - they stay in component logic
    });

    // Apply styles
    Object.entries(style).forEach(([key, value]) => {
      el.style[key] = value;
    });

    // Attach event listeners
    Object.entries(events).forEach(([event, handler]) => {
      el.addEventListener(event, handler);
    });

    // Add content
    if (content) {
      el.textContent = content;
    }

    // Render children
    const allChildren = [...specChildren, ...children];
    allChildren.forEach((child) => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child && child.blueprint) {
        // It's a component instance
        el.appendChild(this._renderComponent(child));
      } else if (child) {
        // It's a spec
        el.appendChild(this._createElementFromSpec(child));
      }
    });

    return el;
  }

  /**
   * Update component (re-render)
   */
  update(component, newProps = null) {
    if (!component.mounted || !component.element) {
      throw new Error('Component not mounted');
    }

    if (newProps) {
      component.props = { ...component.props, ...newProps };
    }

    const newElement = this._renderComponent(component);
    component.element.replaceWith(newElement);
    component.element = newElement;

    if (this.config.debugMode) {
      console.log(`[ScrollMesh] Updated: ${component.name}`);
    }
  }

  /**
   * Unmount component
   */
  unmount(component) {
    if (component.element) {
      component.element.remove();
      component.element = null;
      component.mounted = false;
    }

    this.instances.delete(component.id);

    if (this.config.debugMode) {
      console.log(`[ScrollMesh] Unmounted: ${component.name}`);
    }
  }

  /**
   * Register a connector (orchestrates multiple components)
   */
  connector(name, definition) {
    this.connectors.set(name, definition);

    if (this.config.debugMode) {
      console.log(`[ScrollMesh] Connector registered: ${name}`);
    }

    return definition;
  }

  /**
   * Assemble components using connector
   */
  assemble(connectorName, context = {}) {
    const connector = this.connectors.get(connectorName);
    
    if (!connector) {
      throw new Error(`Connector "${connectorName}" not found`);
    }

    return connector(context, this);
  }

  /**
   * Helper: Create element with children
   */
  h(tag, props = {}, ...children) {
    return {
      tag,
      attrs: props,
      children: children.flat(),
    };
  }

  /**
   * Helper: Repeat component for list
   */
  repeat(items, renderFn) {
    return items.map((item, index) => renderFn(item, index));
  }

  /**
   * Helper: Conditional rendering
   */
  when(condition, thenComponent, elseComponent = null) {
    return condition ? thenComponent : elseComponent;
  }

  /**
   * Helper: Fragment (multiple root elements)
   */
  fragment(...children) {
    return children.flat();
  }

  /**
   * Helper: Portal (render to different location)
   */
  portal(component, targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      throw new Error(`Portal target not found: ${targetSelector}`);
    }

    return this.render(component, target);
  }

  /**
   * Virtualized list (for large datasets)
   */
  virtualList(container, items, renderItem, options = {}) {
    const {
      itemHeight = 50,
      overscan = 3,
    } = options;

    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      throw new Error('Container not found');
    }

    const visibleCount = Math.ceil(containerEl.clientHeight / itemHeight);
    let scrollTop = 0;

    const render = () => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount + overscan, items.length);
      const visibleItems = items.slice(Math.max(0, startIndex - overscan), endIndex);

      containerEl.innerHTML = '';
      containerEl.style.position = 'relative';
      containerEl.style.height = `${items.length * itemHeight}px`;

      visibleItems.forEach((item, i) => {
        const index = startIndex - overscan + i;
        if (index < 0 || index >= items.length) return;

        const itemEl = renderItem(item, index);
        itemEl.style.position = 'absolute';
        itemEl.style.top = `${index * itemHeight}px`;
        itemEl.style.height = `${itemHeight}px`;
        containerEl.appendChild(itemEl);
      });
    };

    containerEl.addEventListener('scroll', () => {
      scrollTop = containerEl.scrollTop;
      render();
    });

    render();
  }

  /**
   * Generate unique ID
   */
  _generateId() {
    return `mesh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get component by element
   */
  getComponent(element) {
    return this.mountedComponents.get(element);
  }

  /**
   * Reset everything
   */
  reset() {
    this.blueprints.clear();
    this.instances.clear();
    this.connectors.clear();
    this.mountedComponents = new WeakMap();
  }
}

