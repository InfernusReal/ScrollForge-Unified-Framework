/**
 * ScrollScript Server Runtime
 * Node.js-specific extensions for ScrollScript
 */

import { ScrollScriptCore } from './core.js';
import http from 'http';
import { parse as parseUrl } from 'url';

export class ScrollScriptServer extends ScrollScriptCore {
  constructor(config = {}) {
    super(config);
    this.routes = new Map();
    this.middleware = [];
    this.wsClients = new Set();
    this.server = null;
  }

  /**
   * Register HTTP route
   */
  route(method, path, actionType, handler = null) {
    const key = `${method.toUpperCase()}:${path}`;
    
    if (handler) {
      // Direct handler provided
      this.routes.set(key, handler);
    } else {
      // Use action system
      this.routes.set(key, async (req, res) => {
        this.trigger(actionType, { req, res });
      });
    }

    if (this.config.debugMode) {
      console.log(`[ScrollScript Server] Route registered: ${key}`);
    }
  }

  /**
   * Shorthand route methods
   */
  get(path, actionType, handler) {
    this.route('GET', path, actionType, handler);
  }

  post(path, actionType, handler) {
    this.route('POST', path, actionType, handler);
  }

  put(path, actionType, handler) {
    this.route('PUT', path, actionType, handler);
  }

  delete(path, actionType, handler) {
    this.route('DELETE', path, actionType, handler);
  }

  /**
   * Add middleware
   */
  use(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Create HTTP server
   */
  createServer() {
    this.server = http.createServer(async (req, res) => {
      // Parse URL
      const parsedUrl = parseUrl(req.url, true);
      const path = parsedUrl.pathname;
      const method = req.method;

      // Apply middleware
      for (const mw of this.middleware) {
        await mw(req, res);
        if (res.headersSent) return;
      }

      // Match route
      const key = `${method}:${path}`;
      const handler = this.routes.get(key);

      if (handler) {
        try {
          await handler(req, res);
        } catch (error) {
          console.error('[ScrollScript Server] Route error:', error);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    });

    return this.server;
  }

  /**
   * Listen on port
   */
  listen(port, callback) {
    if (!this.server) {
      this.createServer();
    }

    this.server.listen(port, () => {
      console.log(`[ScrollScript Server] Listening on port ${port}`);
      if (callback) callback();
    });
  }

  /**
   * Send JSON response helper
   */
  json(res, data, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    
    // Handle circular references safely
    try {
      res.end(JSON.stringify(data));
    } catch (error) {
      // Circular reference detected - use safe serialization
      const safeData = this._sanitizeForJSON(data);
      res.end(JSON.stringify(safeData));
    }
  }

  /**
   * Remove circular references from data
   */
  _sanitizeForJSON(obj) {
    const seen = new WeakSet();
    
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      // Skip framework internals
      if (key === 'server' || key.startsWith('_')) {
        return undefined;
      }
      
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      
      return value;
    }));
  }

  /**
   * Send HTML response helper
   */
  html(res, content, status = 200) {
    res.writeHead(status, { 'Content-Type': 'text/html' });
    res.end(content);
  }

  /**
   * Sync signal to connected clients (WebSocket)
   */
  syncToClients(signalName, value = null) {
    const actualValue = value !== null ? value : this.get(signalName);
    
    const message = JSON.stringify({
      type: 'SIGNAL_UPDATE',
      signal: signalName,
      value: actualValue,
      timestamp: Date.now(),
    });

    this.wsClients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  /**
   * Watch signal and auto-sync to clients
   */
  autoSync(signalName) {
    this.watch(signalName, (value) => {
      this.syncToClients(signalName, value);
    });
  }

  /**
   * Database query helper (generic)
   */
  async query(queryFn, actionType = null) {
    try {
      const result = await queryFn();
      
      if (actionType) {
        this.trigger(actionType, { result });
      }
      
      return result;
    } catch (error) {
      console.error('[ScrollScript Server] Query error:', error);
      throw error;
    }
  }

  /**
   * Schedule recurring action
   */
  schedule(actionType, interval, payload = null) {
    const intervalId = setInterval(() => {
      this.trigger(actionType, payload);
    }, interval);

    return () => clearInterval(intervalId);
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('[ScrollScript Server] Shutting down...');

    // Close WebSocket clients
    this.wsClients.forEach((client) => {
      client.close();
    });
    this.wsClients.clear();

    // Close HTTP server
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
    }

    // Reset core
    this.reset();

    console.log('[ScrollScript Server] Shutdown complete');
  }
}

