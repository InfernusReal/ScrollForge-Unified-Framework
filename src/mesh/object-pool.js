/**
 * Object Pooling
 * Minimize DOM churn by reusing elements
 */

export class ObjectPool {
  constructor(factory, initialSize = 10) {
    this.factory = factory;
    this.available = [];
    this.inUse = new Set();
    
    // Pre-create objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  /**
   * Acquire object from pool
   */
  acquire() {
    let obj;

    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  /**
   * Release object back to pool
   */
  release(obj) {
    if (!this.inUse.has(obj)) return;

    this.inUse.delete(obj);
    
    // Reset object if it has reset method
    if (obj.reset && typeof obj.reset === 'function') {
      obj.reset();
    }

    this.available.push(obj);
  }

  /**
   * Clear pool
   */
  clear() {
    this.available = [];
    this.inUse.clear();
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

/**
 * DOM Element Pool
 */
export class DOMElementPool extends ObjectPool {
  constructor(tagName, initialSize = 10) {
    super(() => document.createElement(tagName), initialSize);
    this.tagName = tagName;
  }

  acquire() {
    const element = super.acquire();
    
    // Clear element
    element.innerHTML = '';
    element.className = '';
    element.style.cssText = '';
    
    // Remove all attributes except data-pool
    Array.from(element.attributes).forEach(attr => {
      if (attr.name !== 'data-pool') {
        element.removeAttribute(attr.name);
      }
    });

    return element;
  }
}

/**
 * Component Instance Pool
 */
export class ComponentPool {
  constructor(componentFactory, size = 10) {
    this.pools = new Map();
    this.componentFactory = componentFactory;
    this.defaultSize = size;
  }

  /**
   * Get pool for component type
   */
  getPool(componentName) {
    if (!this.pools.has(componentName)) {
      this.pools.set(componentName, new ObjectPool(
        () => this.componentFactory(componentName),
        this.defaultSize
      ));
    }
    
    return this.pools.get(componentName);
  }

  /**
   * Acquire component instance
   */
  acquire(componentName) {
    const pool = this.getPool(componentName);
    return pool.acquire();
  }

  /**
   * Release component instance
   */
  release(componentName, instance) {
    const pool = this.getPool(componentName);
    pool.release(instance);
  }

  /**
   * Get all stats
   */
  getStats() {
    const stats = {};
    
    this.pools.forEach((pool, name) => {
      stats[name] = pool.getStats();
    });

    return stats;
  }
}

export const globalDOMPool = new Map();

export function createElementPool(tagName, size) {
  if (!globalDOMPool.has(tagName)) {
    globalDOMPool.set(tagName, new DOMElementPool(tagName, size));
  }
  return globalDOMPool.get(tagName);
}

export function createObjectPool(factory, size) {
  return new ObjectPool(factory, size);
}

