/**
 * Net Hub - Network State Management
 * Centralized network signals and auto wire-up
 */

export class NetHub {
  constructor(scriptInstance, forgeFetch) {
    this.script = scriptInstance;
    this.fetch = forgeFetch;
    
    // Network state signals
    this.script.signal('net.status', 'online');
    this.script.signal('net.latency', 0);
    this.script.signal('net.requests', []);
    this.script.signal('net.errors', []);
    this.script.signal('net.loading', false);
    this.script.signal('net.progress', 0);
    
    this._setupNetworkMonitoring();
    this._setupFetchIntegration();
  }

  /**
   * Setup network monitoring
   */
  _setupNetworkMonitoring() {
    if (typeof window === 'undefined') return;

    // Online/offline detection
    window.addEventListener('online', () => {
      this.script.set('net.status', 'online');
      this.script.trigger('NET_ONLINE');
    });

    window.addEventListener('offline', () => {
      this.script.set('net.status', 'offline');
      this.script.trigger('NET_OFFLINE');
    });

    // Initial status
    this.script.set('net.status', navigator.onLine ? 'online' : 'offline');
  }

  /**
   * Integrate with ForgeFetch
   */
  _setupFetchIntegration() {
    // Request interceptor - track requests
    this.fetch.onRequest((config) => {
      const requests = this.script.get('net.requests');
      const requestId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const entry = {
        id: requestId,
        url: config.url || '',
        method: (config.method || 'GET').toUpperCase(),
        startedAt: Date.now()
      };

      this.script.set('net.requests', [...requests, entry]);
      this.script.set('net.loading', true);

      config._requestId = requestId;
      config._startTime = entry.startedAt;

      return config;
    });

    // Response interceptor - track completion
    this.fetch.onResponse((response) => {
      const config = response.config || {};
      const requests = this.script.get('net.requests');
      const filtered = config._requestId
        ? requests.filter(r => r.id !== config._requestId)
        : requests;

      this.script.set('net.requests', filtered);
      this.script.set('net.loading', filtered.length > 0);

      if (config._startTime) {
        const latency = Date.now() - config._startTime;
        this.script.set('net.latency', latency);
      }

      if (!response.ok) {
        const errors = this.script.get('net.errors');
        this.script.set('net.errors', [
          ...errors,
          {
            status: response.status,
            url: config.url,
            timestamp: Date.now()
          }
        ]);
      }

      return response;
    });
  }

  /**
   * Auto wire-up fetch to action
   */
  wireAction(actionType, url, options = {}) {
    this.script.action(actionType, async (_payload) => {
      try {
        const response = await this.fetch.get(url, options);
        
        if (options.signalName) {
          const data = options.transform ? options.transform(response.data) : response.data;
          this.script.set(options.signalName, data);
        }

        if (options.onSuccess) {
          options.onSuccess(response.data);
        }

        this.script.trigger(`${actionType}_SUCCESS`, response.data);
      } catch (error) {
        this.script.trigger(`${actionType}_ERROR`, error);
        
        if (options.onError) {
          options.onError(error);
        }
      }
    });
  }

  /**
   * Live query - auto-refetch on interval or signal change
   */
  liveQuery(url, signalName, options = {}) {
    const {
      interval,
      refetchOn = [],
      transform,
      cache
    } = options;

    const doFetch = async () => {
      try {
        const response = await this.fetch.get(url, { cache });
        const data = transform ? transform(response.data) : response.data;
        this.script.set(signalName, data);
      } catch (error) {
        console.error('[NetHub] Live query error:', error);
      }
    };

    // Initial fetch
    doFetch();

    // Interval polling
    let intervalId;
    if (interval) {
      intervalId = setInterval(doFetch, interval);
    }

    // Refetch on signal changes
    const unsubscribers = refetchOn.map(sig => {
      return this.script.watch(sig, doFetch);
    });

    // Return cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Get network status
   */
  getStatus() {
    return {
      online: this.script.get('net.status') === 'online',
      loading: this.script.get('net.loading'),
      latency: this.script.get('net.latency'),
      activeRequests: this.script.get('net.requests').length,
      errorCount: this.script.get('net.errors').length
    };
  }

  /**
   * Clear error log
   */
  clearErrors() {
    this.script.set('net.errors', []);
  }
}

export function createNetHub(scriptInstance, forgeFetch) {
  return new NetHub(scriptInstance, forgeFetch);
}

