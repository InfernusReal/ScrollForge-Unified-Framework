/**
 * ScrollFetch - Built-in HTTP client for ScrollForge
 * Like Axios but integrated with ScrollScript signals
 */

export class ScrollFetch {
  constructor(scriptInstance) {
    this.script = scriptInstance;
    this.baseURL = '';
    this.defaultHeaders = {};
    this.interceptors = {
      request: [],
      response: []
    };
  }

  /**
   * Set base URL
   */
  setBaseURL(url) {
    this.baseURL = url;
    return this;
  }

  /**
   * Set default headers
   */
  setHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    return this;
  }

  /**
   * Add request interceptor
   */
  onRequest(fn) {
    this.interceptors.request.push(fn);
    return this;
  }

  /**
   * Add response interceptor
   */
  onResponse(fn) {
    this.interceptors.response.push(fn);
    return this;
  }

  /**
   * Main fetch method
   */
  async fetch(url, options = {}) {
    // Build full URL
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Merge headers
    const headers = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...options.headers
    };

    // Build request config
    let config = {
      method: options.method || 'GET',
      headers,
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

    try {
      // Make request
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
        ok: response.ok
      };

      // Apply response interceptors
      let finalResult = result;
      for (const interceptor of this.interceptors.response) {
        finalResult = await interceptor(finalResult) || finalResult;
      }

      return finalResult;
    } catch (error) {
      throw {
        error: error.message,
        config
      };
    }
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(url, data, options = {}) {
    return this.fetch(url, { ...options, method: 'POST', body: data });
  }

  /**
   * PUT request
   */
  async put(url, data, options = {}) {
    return this.fetch(url, { ...options, method: 'PUT', body: data });
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch(url, data, options = {}) {
    return this.fetch(url, { ...options, method: 'PATCH', body: data });
  }

  /**
   * Reactive GET - Auto-updates signal
   */
  reactiveGet(url, signalName, options = {}) {
    const {
      interval,
      transform,
      onError
    } = options;

    const fetchData = async () => {
      try {
        const response = await this.get(url);
        const data = transform ? transform(response.data) : response.data;
        this.script.set(signalName, data);
      } catch (error) {
        if (onError) onError(error);
        console.error('[ScrollFetch] Reactive GET error:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Polling if interval specified
    if (interval) {
      const intervalId = setInterval(fetchData, interval);
      return () => clearInterval(intervalId);
    }

    return () => {};
  }

  /**
   * Signal-driven POST - Watch signal and POST on change
   */
  syncPost(signalName, url, options = {}) {
    return this.script.watch(signalName, async (value) => {
      try {
        await this.post(url, value, options);
      } catch (error) {
        console.error('[ScrollFetch] Sync POST error:', error);
      }
    });
  }

  /**
   * Reactive resource - Full CRUD on a signal
   */
  resource(signalName, baseURL) {
    return {
      // Fetch all
      fetch: () => this.reactiveGet(baseURL, signalName),
      
      // Create
      create: async (item) => {
        const response = await this.post(baseURL, item);
        const current = this.script.get(signalName) || [];
        this.script.set(signalName, [...current, response.data]);
        return response;
      },
      
      // Update
      update: async (id, item) => {
        const response = await this.put(`${baseURL}/${id}`, item);
        const current = this.script.get(signalName) || [];
        const updated = current.map(i => i.id === id ? response.data : i);
        this.script.set(signalName, updated);
        return response;
      },
      
      // Delete
      delete: async (id) => {
        await this.delete(`${baseURL}/${id}`);
        const current = this.script.get(signalName) || [];
        this.script.set(signalName, current.filter(i => i.id !== id));
      }
    };
  }
}

/**
 * Create ScrollFetch instance for client
 */
export function createScrollFetch(scriptInstance) {
  return new ScrollFetch(scriptInstance);
}

