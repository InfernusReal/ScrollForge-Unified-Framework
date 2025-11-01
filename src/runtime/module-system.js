/**
 * Multi-Layered Module System
 * Lean core + on-demand feature modules
 */

export class ModuleSystem {
  constructor() {
    this.loadedModules = new Set();
    this.moduleRegistry = new Map();
    this.coreModules = new Set(['script', 'weave', 'mesh']);
  }

  /**
   * Register module
   */
  register(name, loader) {
    this.moduleRegistry.set(name, {
      name,
      loader,
      loaded: false,
      exports: null
    });
  }

  /**
   * Load module on demand
   */
  async load(name) {
    if (this.loadedModules.has(name)) {
      return this.moduleRegistry.get(name).exports;
    }

    const module = this.moduleRegistry.get(name);
    
    if (!module) {
      throw new Error(`Module '${name}' not found`);
    }

    console.log(`[ModuleSystem] Loading: ${name}`);

    try {
      const exports = await module.loader();
      module.exports = exports;
      module.loaded = true;
      this.loadedModules.add(name);

      return exports;
    } catch (error) {
      console.error(`[ModuleSystem] Failed to load ${name}:`, error);
      throw error;
    }
  }

  /**
   * Preload module
   */
  async preload(name) {
    if (this.loadedModules.has(name)) return;

    this.load(name).catch(err => {
      console.warn('[ModuleSystem] Preload failed:', err);
    });
  }

  /**
   * Unload module
   */
  unload(name) {
    if (this.coreModules.has(name)) {
      throw new Error(`Cannot unload core module: ${name}`);
    }

    this.loadedModules.delete(name);
    
    const module = this.moduleRegistry.get(name);
    if (module) {
      module.loaded = false;
      module.exports = null;
    }
  }

  /**
   * Get loaded modules
   */
  getLoaded() {
    return Array.from(this.loadedModules);
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      total: this.moduleRegistry.size,
      loaded: this.loadedModules.size,
      pending: this.moduleRegistry.size - this.loadedModules.size
    };
  }
}

// Pre-registered feature modules
const featureModules = {
  'ai-helpers': () => import('./features/ai-helpers.js'),
  'advanced-weave': () => import('./features/advanced-weave.js'),
  'collaboration-pro': () => import('./features/collaboration-pro.js'),
  'analytics': () => import('./features/analytics.js'),
  'forms': () => import('./features/forms.js'),
  'routing': () => import('./features/routing.js')
};

export const globalModuleSystem = new ModuleSystem();

// Register feature modules
Object.entries(featureModules).forEach(([name, loader]) => {
  globalModuleSystem.register(name, loader);
});

export function loadModule(name) {
  return globalModuleSystem.load(name);
}

