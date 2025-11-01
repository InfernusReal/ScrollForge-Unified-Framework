/**
 * ForgeFetch - Advanced HTTP Client
 * Retry, backoff, cancellation, caching, adapters
 */

export class ForgeFetch {
  constructor(scriptInstance) {
    this.script = scriptInstance;
    this.baseURL = '';
    this.defaultHeaders = {};
    this.interceptors = { request: [], response: [] };
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.cancelTokens = new Map();
  }

  /**
   * Set base URL
   */
  setBaseURL(url) {
    this.baseURL = url;
    return this;
  }

  /**
   * Set headers
   */
  setHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    return this;
  }

  /**
   * Request interceptor
   */
  onRequest(fn) {
    this.interceptors.request.push(fn);
    return this;
  }

  /**
   * Response interceptor
   */
  onResponse(fn) {
    this.interceptors.response.push(fn);
    return this;
  }

  /**
   * Main fetch with retry and caching
   */
  async fetch(url, options = {}) {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const cacheKey = this._composeCacheKey(fullURL, options);
    
    // Check cache
    if (options.cache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < (options.cache.ttl || 60000)) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    // Build config
    let config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...options.headers
      },
      url: fullURL,
      ...options
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config) || config;
    }

    // Body handling
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    // Retry logic
    const maxRetries = options.retry?.attempts || 0;
    const backoff = options.retry?.backoff || 'linear';
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Cancellation check
        if (options.cancelToken && this.cancelTokens.has(options.cancelToken)) {
          throw new Error('Request cancelled');
        }

        const response = await fetch(fullURL, config);
        
        // Parse response
        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        const result = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          ok: response.ok,
          config
        };

        // Apply response interceptors
        let finalResult = result;
        for (const interceptor of this.interceptors.response) {
          finalResult = await interceptor(finalResult) || finalResult;
        }

        if (!finalResult.config) {
          finalResult.config = config;
        }

        // Cache if requested
        if (options.cache && result.ok) {
          this.cache.set(cacheKey, {
            data: finalResult,
            timestamp: Date.now()
          });
        }

        if (options.cancelToken) {
          this.cancelTokens.delete(options.cancelToken);
        }

        return finalResult;

      } catch (error) {
        if (options.cancelToken && this.cancelTokens.has(options.cancelToken)) {
          this.cancelTokens.delete(options.cancelToken);
          lastError = new Error('Request cancelled');
          break;
        }

        lastError = error;

        // Don't retry on last attempt
        if (attempt < maxRetries) {
          const delay = this._calculateBackoff(attempt, backoff);
          await this._sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Calculate backoff delay
   */
  _calculateBackoff(attempt, strategy) {
    if (strategy === 'exponential') {
      return Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s...
    } else {
      return (attempt + 1) * 1000; // 1s, 2s, 3s, 4s...
    }
  }

  /**
   * Sleep helper
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * HTTP verb methods
   */
  async get(url, options = {}) {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.fetch(url, { ...options, method: 'POST', body: data });
  }

  async put(url, data, options = {}) {
    return this.fetch(url, { ...options, method: 'PUT', body: data });
  }

  async delete(url, options = {}) {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }

  async patch(url, data, options = {}) {
    return this.fetch(url, { ...options, method: 'PATCH', body: data });
  }

  /**
   * Create cancel token
   */
  createCancelToken() {
    const token = Symbol('cancelToken');
    return {
      token,
      cancel: () => this.cancelTokens.add(token)
    };
  }

  /**
   * Reactive GET - auto-updates signal
   */
  reactiveGet(url, signalName, options = {}) {
    const {
      interval,
      transform,
      onError,
      cache
    } = options;

    const fetchData = async () => {
      try {
        const response = await this.get(url, { cache });
        const data = transform ? transform(response.data) : response.data;
        this.script.set(signalName, data);
      } catch (error) {
        if (onError) onError(error);
        console.error('[ForgeFetch] Reactive GET error:', error);
      }
    };

    fetchData();

    if (interval) {
      const intervalId = setInterval(fetchData, interval);
      return () => clearInterval(intervalId);
    }

    return () => {};
  }

  /**
   * Reactive resource with optimistic updates
   */
  resource(signalName, baseURL, options = {}) {
    return {
      fetch: async () => {
        const response = await this.get(baseURL, options);
        this.script.set(signalName, response.data);
        return response;
      },

      create: async (item, optimistic = true) => {
        if (optimistic) {
          // Optimistic update
          const current = this.script.get(signalName) || [];
          const tempItem = { ...item, _optimistic: true, _tempId: Date.now() };
          this.script.set(signalName, [...current, tempItem]);
          return await this._finalizeCreate({ baseURL, item, options, signalName, optimistic, tempItem });
        }

        return this._finalizeCreate({ baseURL, item, options, signalName, optimistic, tempItem: null });
      },

      update: async (id, data, optimistic = true) => {
        const current = this.script.get(signalName) || [];
        const oldItem = current.find(i => i.id === id);

        if (optimistic && oldItem) {
          // Optimistic update
          const updated = current.map(i => i.id === id ? { ...i, ...data, _optimistic: true } : i);
          this.script.set(signalName, updated);
        }

        try {
          const response = await this.put(`${baseURL}/${id}`, data, options);
          const updated = current.map(i => i.id === id ? response.data : i);
          this.script.set(signalName, updated);
          return response;
        } catch (error) {
          if (optimistic && oldItem) {
            // Rollback
            const updated = current.map(i => i.id === id ? oldItem : i);
            this.script.set(signalName, updated);
          }
          throw error;
        }
      },

      delete: async (id, optimistic = true) => {
        const current = this.script.get(signalName) || [];
        const item = current.find(i => i.id === id);

        if (optimistic) {
          // Optimistic delete
          this.script.set(signalName, current.filter(i => i.id !== id));
        }

        try {
          await this.fetch(`${baseURL}/${id}`, { ...options, method: 'DELETE' });
        } catch (error) {
          if (optimistic && item) {
            // Rollback
            this.script.set(signalName, [...current]);
          }
          throw error;
        }
      }
    };
  }

  /**
   * Clear cache
   */
  clearCache(url = null, options = {}) {
    if (url) {
      const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      const key = this._composeCacheKey(fullURL, options);
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  async _finalizeCreate({ baseURL, options, signalName, optimistic, tempItem, item }) {
    try {
      const response = await this.post(baseURL, item, options);
      const current = this.script.get(signalName) || [];
      const updated = optimistic && tempItem
        ? current.map(i => {
            if (i._tempId && tempItem && i._tempId === tempItem._tempId) {
              return response.data;
            }
            return i;
          })
        : [...current, response.data];

      this.script.set(signalName, updated);
      return response;
    } catch (error) {
      if (optimistic && tempItem) {
        const current = this.script.get(signalName) || [];
        this.script.set(signalName, current.filter(i => !(i._tempId && tempItem && i._tempId === tempItem._tempId)));
      }
      throw error;
    }
  }

  _composeCacheKey(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const rawBody = options.body ?? '';
    const body = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    return `${method}:${url}:${body}`;
  }
}

export function createForgeFetch(scriptInstance) {
  return new ForgeFetch(scriptInstance);
}

