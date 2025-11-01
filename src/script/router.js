/**
 * Composable Router System
 * Nested routing, wildcards, async guards
 */

export class Router {
  constructor(options = {}) {
    this.routes = [];
    this.middleware = [];
    this.prefix = options.prefix || '';
    this.guards = [];
  }

  /**
   * Add route
   */
  route(method, path, handler, options = {}) {
    const fullPath = this.prefix + path;
    
    this.routes.push({
      method: method.toUpperCase(),
      path: fullPath,
      pattern: this._pathToPattern(fullPath),
      handler,
      guards: options.guards || [],
      middleware: options.middleware || [],
      params: this._extractParams(fullPath)
    });

    return this;
  }

  /**
   * HTTP verb helpers
   */
  get(path, handler, options) {
    return this.route('GET', path, handler, options);
  }

  post(path, handler, options) {
    return this.route('POST', path, handler, options);
  }

  put(path, handler, options) {
    return this.route('PUT', path, handler, options);
  }

  delete(path, handler, options) {
    return this.route('DELETE', path, handler, options);
  }

  patch(path, handler, options) {
    return this.route('PATCH', path, handler, options);
  }

  /**
   * Add global guard
   */
  guard(guardFn) {
    this.guards.push(guardFn);
    return this;
  }

  /**
   * Use middleware
   */
  use(middleware) {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Nest another router
   */
  nest(prefix, router) {
    router.routes.forEach(route => {
      this.routes.push({
        ...route,
        path: this.prefix + prefix + route.path.replace(router.prefix, ''),
        pattern: this._pathToPattern(this.prefix + prefix + route.path.replace(router.prefix, ''))
      });
    });

    return this;
  }

  /**
   * Match route
   */
  async match(method, pathname, req, res, beforeHandler) {
    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = pathname.match(route.pattern);
      if (!match) continue;

      // Extract params
      req.params = match.groups || {};
      const routeKey = `${route.method}:${route.path}`;

      // Run global guards
      for (const guard of this.guards) {
        const allowed = await guard(req, res);
        if (!allowed) return { handled: true, routeKey };
      }

      // Run route guards
      for (const guard of route.guards) {
        const allowed = await guard(req, res);
        if (!allowed) return { handled: true, routeKey };
      }

      // Run global middleware
      for (const mw of this.middleware) {
        const result = await mw(req, res);
        if (res.headersSent || result === false) {
          return { handled: true, routeKey };
        }
      }

      // Run route middleware
      for (const mw of route.middleware) {
        const result = await mw(req, res);
        if (res.headersSent || result === false) {
          return { handled: true, routeKey };
        }
      }

      if (beforeHandler) {
        const proceed = await beforeHandler(routeKey);
        if (!proceed) {
          return { handled: true, routeKey };
        }
      }

      // Execute handler
      try {
        await route.handler(req, res);
        return { handled: true, routeKey };
      } catch (error) {
        return { handled: true, error, routeKey };
      }
    }

    return { handled: false };
  }

  /**
   * Convert path to regex with wildcards
   */
  _pathToPattern(path) {
    const escaped = path.replace(/([.+?^=!:${}()|[\]/\\])/g, '\\$1');
    const pattern = escaped
      .replace(/\\:(\w+)/g, '(?<$1>[^/]+)')
      .replace(/\\\*/g, '.*');
    return new RegExp(`^${pattern}$`);
  }

  /**
   * Extract parameter names
   */
  _extractParams(path) {
    const matches = path.match(/:(\w+)/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  }

  /**
   * Get all routes (for inspection)
   */
  getRoutes() {
    return this.routes.map(r => ({
      method: r.method,
      path: r.path
    }));
  }
}

/**
 * Create router
 */
export function createRouter(options) {
  return new Router(options);
}

