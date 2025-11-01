/**
 * Copy-On-Write State System
 * Memory-efficient snapshots for large state
 */

export class CopyOnWriteStore {
  constructor() {
    this.snapshots = [];
    this.currentVersion = 0;
    this.maxSnapshots = 100;
    this.structuralSharing = true;
  }

  /**
   * Create snapshot (cheap - structural sharing)
   */
  snapshot(state) {
    const storedState = this.structuralSharing
      ? this._cloneImmutable(state)
      : this._deepClone(state);

    const snapshot = {
      version: this.currentVersion++,
      state: storedState,
      timestamp: Date.now()
    };

    this.snapshots.push(snapshot);

    // Limit snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Deep clone and freeze for structural sharing mode
   */
  _cloneImmutable(obj, cache = new WeakMap()) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (cache.has(obj)) {
      return cache.get(obj);
    }

    const clone = Array.isArray(obj) ? [] : {};
    cache.set(obj, clone);

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        clone[i] = this._cloneImmutable(obj[i], cache);
      }
    } else {
      Object.keys(obj).forEach(key => {
        clone[key] = this._cloneImmutable(obj[key], cache);
      });
    }

    return Object.freeze(clone);
  }

  /**
   * Deep clone (when needed)
   */
  _deepClone(obj) {
    if (typeof structuredClone === 'function') {
      try {
        return structuredClone(obj);
      } catch (e) {
        // Fallback
      }
    }

    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Restore snapshot
   */
  restore(snapshot) {
    return this._deepClone(snapshot.state);
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage() {
    let size = 0;

    this.snapshots.forEach(snap => {
      size += JSON.stringify(snap.state).length;
    });

    return {
      snapshots: this.snapshots.length,
      estimatedBytes: size,
      estimatedMB: (size / 1048576).toFixed(2)
    };
  }

  /**
   * Clear old snapshots
   */
  gc(keepLast = 10) {
    if (this.snapshots.length > keepLast) {
      this.snapshots = this.snapshots.slice(-keepLast);
    }
  }
}

export function createCOWStore() {
  return new CopyOnWriteStore();
}

