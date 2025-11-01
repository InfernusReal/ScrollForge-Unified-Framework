/**
 * ScrollScript Advanced Server Runtime
 * Express-killer with reactive APIs and full-stack magic
 */

import { ScrollScriptCore } from './core.js';
import http from 'http';
import { parse as parseUrl } from 'url';
import { parse as parseQuery } from 'querystring';

export class ScrollScriptServerAdvanced extends ScrollScriptCore {
  constructor(config = {}) {
    super(config);
    this.routes = new Map();
    this.middleware = [];
    this.wsClients = new Set();
    this.server = null;
    this.sessions = new Map();
    this.rateLimits = new Map();
    this.cache = new Map();
    this.staticPaths = [];
    this.cors = config.cors || { enabled: false };
    this.bodyParsers = {
      json: true,
      urlencoded: true,
      multipart: false
    };
  }

  /**
   * Register route with params support
   */
  route(method, path, actionType, handler = null) {
    const key = `${method.toUpperCase()}:${path}`;
    const pattern = this._pathToRegex(path);
    
    const routeHandler = handler || (async (req, res) => {
      this.trigger(actionType, { req, res });
    });
    
    this.routes.set(key, {
      pattern,
      path,
      handler: routeHandler,
      params: this._extractParamNames(path)
    });

    if (this.config.debugMode) {
      console.log(`[ScrollScript Server] Route: ${key}`);
    }

    return this;
  }

  /**
   * Convert path to regex (supports :params)
   */
  _pathToRegex(path) {
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, '(?<$1>[^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  /**
   * Extract parameter names from path
   */
  _extractParamNames(path) {
    const matches = path.match(/:(\w+)/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  }

  /**
   * Match route and extract params
   */
  _matchRoute(method, pathname) {
    for (const [key, route] of this.routes) {
      const [routeMethod] = key.split(':');
      if (routeMethod !== method) continue;
      
      const match = pathname.match(route.pattern);
      if (match) {
        return {
          route,
          params: match.groups || {}
        };
      }
    }
    return null;
  }

  /**
   * Shorthand methods
   */
  get(path, actionType, handler) {
    return this.route('GET', path, actionType, handler);
  }

  post(path, actionType, handler) {
    return this.route('POST', path, actionType, handler);
  }

  put(path, actionType, handler) {
    return this.route('PUT', path, actionType, handler);
  }

  delete(path, actionType, handler) {
    return this.route('DELETE', path, actionType, handler);
  }

  patch(path, actionType, handler) {
    return this.route('PATCH', path, actionType, handler);
  }

  /**
   * Serve static files
   */
  static(path, directory) {
    this.staticPaths.push({ path, directory });
    return this;
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
   * Rate limiting
   */
  rateLimit(path, max, window) {
    this.rateLimits.set(path, { max, window, requests: new Map() });
    return this;
  }

  /**
   * Session middleware
   */
  useSession(config = {}) {
    const sessionStore = this.sessions;
    const cookieName = config.cookieName || 'scrollforge_session';
    
    this.use((req, res) => {
      // Parse session from cookie
      const cookies = this._parseCookies(req.headers.cookie);
      const sessionId = cookies[cookieName];
      
      if (sessionId && sessionStore.has(sessionId)) {
        req.session = sessionStore.get(sessionId);
      } else {
        const newId = this._generateId();
        req.session = { id: newId };
        sessionStore.set(newId, req.session);
        res.setHeader('Set-Cookie', `${cookieName}=${newId}; HttpOnly; Path=/`);
      }
    });
    
    return this;
  }

  /**
   * Body parsing
   */
  async _parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const contentType = req.headers['content-type'] || '';
          
          if (contentType.includes('application/json')) {
            resolve(JSON.parse(body));
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            resolve(parseQuery(body));
          } else {
            resolve(body);
          }
        } catch (error) {
          resolve(body);
        }
      });
      
      req.on('error', reject);
    });
  }

  /**
   * Validation middleware
   */
  validate(schema) {
    return (req, res) => {
      const errors = [];
      
      Object.entries(schema).forEach(([field, rules]) => {
        const value = req.body?.[field] || req.query?.[field] || req.params?.[field];
        
        if (rules.required && !value) {
          errors.push(`${field} is required`);
        }
        
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be ${rules.type}`);
        }
        
        if (rules.min && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} is invalid`);
        }
      });
      
      if (errors.length > 0) {
        this.json(res, { errors }, 400);
        return false;
      }
      
      return true;
    };
  }

  /**
   * Create HTTP server with all features
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

      // Parse URL
      const parsedUrl = parseUrl(req.url, true);
      const pathname = parsedUrl.pathname;
      const query = parsedUrl.query;

      // Add query to req
      req.query = query;

      // Parse body
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        req.body = await this._parseBody(req);
      }

      // Rate limiting
      if (!this._checkRateLimit(pathname, req)) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Too Many Requests' }));
        return;
      }

      // Apply middleware
      for (const mw of this.middleware) {
        const result = await mw(req, res);
        if (res.headersSent || result === false) return;
      }

      // Match route
      const match = this._matchRoute(req.method, pathname);
      
      if (match) {
        req.params = match.params;
        
        try {
          await match.route.handler(req, res);
        } catch (error) {
          console.error('[ScrollScript Server] Error:', error);
          if (!res.headersSent) {
            this.json(res, { error: 'Internal Server Error' }, 500);
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
   * Check rate limit
   */
  _checkRateLimit(path, req) {
    const limit = this.rateLimits.get(path);
    if (!limit) return true;

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!limit.requests.has(ip)) {
      limit.requests.set(ip, []);
    }
    
    const requests = limit.requests.get(ip);
    const windowStart = now - limit.window;
    
    // Remove old requests
    const recent = requests.filter(time => time > windowStart);
    limit.requests.set(ip, recent);
    
    if (recent.length >= limit.max) {
      return false;
    }
    
    recent.push(now);
    return true;
  }

  /**
   * Parse cookies
   */
  _parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.split('=').map(c => c.trim());
      cookies[name] = value;
    });
    
    return cookies;
  }

  /**
   * Generate ID
   */
  _generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper methods
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
   * Remove circular references and framework internals from data
   */
  _sanitizeForJSON(obj) {
    const seen = new WeakSet();
    
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      // Skip framework internals
      if (key === 'server' || key === 'channels' || key === 'router' || 
          key === 'sessions' || key.startsWith('_')) {
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

  html(res, content, status = 200) {
    res.writeHead(status, { 'Content-Type': 'text/html' });
    res.end(content);
  }

  redirect(res, location, status = 302) {
    res.writeHead(status, { 'Location': location });
    res.end();
  }

  /**
   * Sync signal to all connected clients
   */
  syncToClients(signalName, value = null) {
    const actualValue = value !== null ? value : this.get(signalName);
    
    const message = JSON.stringify({
      type: 'SIGNAL_SYNC',
      signal: signalName,
      value: actualValue,
      timestamp: Date.now(),
    });

    this.wsClients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  /**
   * Auto-sync signal (watch and broadcast)
   */
  autoSync(signalName) {
    this.watch(signalName, (value) => {
      this.syncToClients(signalName, value);
    });
    return this;
  }

  /**
   * Listen on port
   */
  listen(port, callback) {
    if (!this.server) {
      this.createServer();
    }

    this.server.listen(port, () => {
      console.log(`[ScrollScript Server] Running on http://localhost:${port}`);
      if (callback) callback();
    });

    return this;
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('[ScrollScript Server] Shutting down...');

    this.wsClients.forEach((client) => client.close());
    this.wsClients.clear();

    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
    }

    this.reset();
    console.log('[ScrollScript Server] Shutdown complete');
  }
}

