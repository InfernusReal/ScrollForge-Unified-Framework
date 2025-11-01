/**
 * ScrollScript Server Ultimate
 * The complete backend runtime with ALL features
 */

import { ScrollScriptCore } from './core.js';
import { createRouter } from './router.js';
import { ChannelManager } from './channels.js';
import { MiddlewareLanes } from './middleware-lanes.js';
import { pipeline } from './action-pipelines.js';
import { createDevTools } from './dev-tools.js';
import { createCollaborationLoop } from './collaboration.js';
import http from 'http';

export class ScrollScriptServerUltimate extends ScrollScriptCore {
  constructor(config = {}) {
    super(config);
    
    // Core systems
    this.router = createRouter();
    this.lanes = new MiddlewareLanes();
    this.channels = new ChannelManager(this);
    this.devTools = createDevTools(this);
    this.collaboration = null; // Set after server creation
    this.server = null;
    
    // Config
    this.cors = config.cors || { enabled: false };
    this.sessions = new Map();
  }

  /**
   * Create composable router
   */
  createRouter(prefix) {
    return createRouter({ prefix });
  }

  /**
   * Use router
   */
  use(pathOrMiddleware, maybeRouter) {
    if (typeof pathOrMiddleware === 'function') {
      // Global middleware
      this.lanes.addBefore('custom', pathOrMiddleware);
    } else if (maybeRouter) {
      // Nest router
      this.router.nest(pathOrMiddleware, maybeRouter);
    } else if (pathOrMiddleware && pathOrMiddleware.routes) {
      // Root router
      this.router = pathOrMiddleware;
    }
    return this;
  }

  /**
   * Before middleware
   */
  before(name, middleware) {
    this.lanes.addBefore(name, middleware);
    return this;
  }

  /**
   * After middleware
   */
  after(name, middleware) {
    this.lanes.addAfter(name, middleware);
    return this;
  }

  /**
   * Error boundary
   */
  errorBoundary(handler) {
    this.lanes.addErrorBoundary(handler);
    return this;
  }

  /**
   * Per-route middleware
   */
  perRoute(path, middleware) {
    this.lanes.addPerRoute(path, middleware);
    return this;
  }

  /**
   * Register routes
   */
  get(path, handler, options) {
    this.router.get(path, handler, options);
    return this;
  }

  post(path, handler, options) {
    this.router.post(path, handler, options);
    return this;
  }

  put(path, handler, options) {
    this.router.put(path, handler, options);
    return this;
  }

  delete(path, handler, options) {
    this.router.delete(path, handler, options);
    return this;
  }

  patch(path, handler, options) {
    this.router.patch(path, handler, options);
    return this;
  }

  /**
   * Create action pipeline route
   */
  pipeline() {
    return pipeline(this);
  }

  /**
   * Create/get channel
   */
  channel(name, options) {
    return this.channels.channel(name, options);
  }

  /**
   * Enable CORS
   */
  enableCORS(options = {}) {
    this.cors = {
      enabled: true,
      origin: options.origin || '*',
      methods: options.methods || 'GET,POST,PUT,DELETE,PATCH',
      headers: options.headers || 'Content-Type,Authorization'
    };
    return this;
  }

  /**
   * Create HTTP server
   */
  createServer() {
    this.server = http.createServer(async (req, res) => {
      // CORS
      if (this.cors.enabled) {
        res.setHeader('Access-Control-Allow-Origin', this.cors.origin);
        res.setHeader('Access-Control-Allow-Methods', this.cors.methods);
        res.setHeader('Access-Control-Allow-Headers', this.cors.headers);
        
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }
      }

      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      const pathname = parsedUrl.pathname;

      // Parse query
      req.query = Object.fromEntries(parsedUrl.searchParams);

      // Parse body
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        req.body = await this._parseBody(req);
      }

      // Execute before middleware
      const beforeOk = await this.lanes.executeBefore(req, res);
      if (!beforeOk) return;

      // Match route
      const result = await this.router.match(
        req.method,
        pathname,
        req,
        res,
        async (routeKey) => this.lanes.executeRoute(routeKey, req, res)
      );

      if (!result.handled) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      } else if (result.error) {
        await this.lanes.handleError(result.error, req, res, 'route', result.routeKey || pathname);
      }

      // Execute after middleware
      await this.lanes.executeAfter(req, res);
    });

    // Initialize WebSocket
    this.channels.initializeWebSocket(this.server);

    // Setup collaboration
    this.collaboration = createCollaborationLoop(this, this.channels);

    return this.server;
  }

  /**
   * Parse request body
   */
  async _parseBody(req) {
    return new Promise((resolve) => {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const contentType = req.headers['content-type'] || '';
          
          if (contentType.includes('application/json')) {
            resolve(JSON.parse(body));
          } else {
            resolve(body);
          }
        } catch (error) {
          resolve(body);
        }
      });
    });
  }

  /**
   * Start server
   */
  listen(port, callback) {
    if (!this.server) {
      this.createServer();
    }

    this.server.listen(port, () => {
      console.log(`[ScrollScript Server] Running on http://localhost:${port}`);
      console.log('[ok] WebSocket server ready on ws://localhost:' + port + '/ws');
      if (callback) callback();
    });

    return this;
  }

  /**
   * Enable dev mode
   */
  dev(options = {}) {
    this.devTools.enableTrace();
    
    if (options.hotReload) {
      this.devTools.enableHotReload(options.watchPaths || ['./']);
    }

    return this;
  }

  /**
   * Helper methods
   */
  json(res, data, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  html(res, content, status = 200) {
    res.writeHead(status, { 'Content-Type': 'text/html' });
    res.end(content);
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('[ScrollScript Server] Shutting down...');
    
    this.devTools.cleanup();
    
    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
    }

    this.reset();
    console.log('[ScrollScript Server] Shutdown complete');
  }
}

