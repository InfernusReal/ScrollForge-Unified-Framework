/**
 * Code Splitting System
 * Per-component lazy loading and route-based splitting
 */

export class CodeSplitter {
  constructor() {
    this.chunks = new Map();
    this.loadedChunks = new Set();
    this.chunkMap = new Map(); // component -> chunk
  }

  /**
   * Register component for lazy loading
   */
  registerLazy(componentName, loader) {
    const chunkId = `chunk_${componentName}_${Date.now()}`;
    
    this.chunks.set(chunkId, {
      name: componentName,
      loader,
      loaded: false,
      module: null
    });

    this.chunkMap.set(componentName, chunkId);

    return chunkId;
  }

  /**
   * Load chunk on demand
   */
  async loadChunk(chunkId) {
    if (this.loadedChunks.has(chunkId)) {
      return this.chunks.get(chunkId).module;
    }

    const chunk = this.chunks.get(chunkId);
    if (!chunk) {
      throw new Error(`Chunk ${chunkId} not found`);
    }

    console.log(`[CodeSplitter] Loading chunk: ${chunk.name}`);

    try {
      const module = await chunk.loader();
      chunk.module = module;
      chunk.loaded = true;
      this.loadedChunks.add(chunkId);

      return module;
    } catch (error) {
      console.error(`[CodeSplitter] Failed to load chunk ${chunkId}:`, error);
      throw error;
    }
  }

  /**
   * Preload chunk (don't wait)
   */
  preload(chunkId) {
    if (this.loadedChunks.has(chunkId)) return;

    // Load in background
    this.loadChunk(chunkId).catch(err => {
      console.warn('[CodeSplitter] Preload failed:', err);
    });
  }

  /**
   * Get chunk stats
   */
  getStats() {
    return {
      total: this.chunks.size,
      loaded: this.loadedChunks.size,
      pending: this.chunks.size - this.loadedChunks.size
    };
  }
}

/**
 * Lazy component wrapper
 */
export function lazy(loader) {
  const splitter = globalCodeSplitter;
  const componentName = loader.name || 'LazyComponent';
  const chunkId = splitter.registerLazy(componentName, loader);

  return {
    _isLazy: true,
    _chunkId: chunkId,
    
    async load() {
      return await splitter.loadChunk(chunkId);
    },
    
    preload() {
      splitter.preload(chunkId);
    }
  };
}

// Global instance
export const globalCodeSplitter = new CodeSplitter();

