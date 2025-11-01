/**
 * Dev/Prod Tooling
 * Hot reload, trace logs, test helpers
 */

export class DevTools {
  constructor(server) {
    this.server = server;
    this.requestLog = [];
    this.traceEnabled = false;
    this.hotReloadEnabled = false;
    this.watchers = [];
  }

  /**
   * Enable request tracing
   */
  enableTrace() {
    this.traceEnabled = true;
    
    // Log all requests
    this.server.use((req, res) => {
      const start = Date.now();
      
      // Capture response
      const originalEnd = res.end;
      res.end = function(...args) {
        const duration = Date.now() - start;
        
        console.log(`[Trace] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        
        originalEnd.apply(res, args);
      };
    });

    console.log('[DevTools] Request tracing enabled');
    return this;
  }

  /**
   * Enable hot reload
   */
  enableHotReload(watchPaths = []) {
    if (this.hotReloadEnabled) return this;
    this.hotReloadEnabled = true;

    if (typeof require === 'undefined') {
      console.warn('[DevTools] Hot reload requires Node.js');
      return this;
    }

    const fs = require('fs');
    const path = require('path');

    // Watch file changes
    watchPaths.forEach(watchPath => {
      const watcher = fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          console.log(`[HotReload] File changed: ${filename}`);
          this._reloadModule(path.join(watchPath, filename));
        }
      });

      this.watchers.push(watcher);
    });

    console.log('[DevTools] Hot reload enabled');
    return this;
  }

  /**
   * Reload module
   */
  _reloadModule(modulePath) {
    try {
      // Clear require cache
      delete require.cache[require.resolve(modulePath)];
      console.log(`[HotReload] Module reloaded: ${modulePath}`);
    } catch (error) {
      console.error('[HotReload] Reload error:', error);
    }
  }

  /**
   * Get request log
   */
  getRequestLog() {
    return this.requestLog;
  }

  /**
   * Test helper - simulate request
   */
  async simulateRequest(method, path, options = {}) {
    const { body, query, headers, params } = options;

    const req = {
      method,
      url: query ? `${path}?${new URLSearchParams(query)}` : path,
      headers: headers || {},
      body: body || {},
      query: query || {},
      params: params || {},
      _simulated: true
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      headersSent: false,

      writeHead: function(status, headers) {
        this.statusCode = status;
        this.headers = { ...this.headers, ...headers };
        this.headersSent = true;
      },

      end: function(data) {
        this.body = data;
        this.headersSent = true;
      },

      setHeader: function(name, value) {
        this.headers[name] = value;
      }
    };

    // Execute request through server
    await this._executeRoute(req, res);

    return {
      status: res.statusCode,
      headers: res.headers,
      body: res.body ? JSON.parse(res.body) : null
    };
  }

  /**
   * Execute route (for testing)
   */
  async _executeRoute(req, _res) {
    // This would need to call the server's route matching logic
    // Simplified for now
    console.log(`[Test] Simulating ${req.method} ${req.url}`);
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.watchers.forEach(watcher => watcher.close());
    this.watchers = [];
  }
}

export function createDevTools(server) {
  return new DevTools(server);
}

