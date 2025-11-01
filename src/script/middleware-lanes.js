/**
 * Middleware Lanes System
 * Before/after hooks, error boundaries, priority queues
 */

export class MiddlewareLanes {
  constructor() {
    this.before = [];
    this.after = [];
    this.errorHandlers = [];
    this.perRoute = new Map();
  }

  /**
   * Add before middleware
   */
  addBefore(name, middleware) {
    this.before.push({ name, middleware });
    return this;
  }

  /**
   * Add after middleware
   */
  addAfter(name, middleware) {
    this.after.push({ name, middleware });
    return this;
  }

  /**
   * Add error boundary
   */
  addErrorBoundary(handler) {
    this.errorHandlers.push(handler);
    return this;
  }

  /**
   * Add per-route middleware
   */
  addPerRoute(routeKey, middleware) {
    if (!this.perRoute.has(routeKey)) {
      this.perRoute.set(routeKey, []);
    }
    this.perRoute.get(routeKey).push(middleware);
    return this;
  }

  /**
   * Execute before middleware
   */
  async executeBefore(req, res) {
    for (const { name, middleware } of this.before) {
      try {
        const result = await middleware(req, res);
        if (res.headersSent || result === false) {
          return false;
        }
      } catch (error) {
        await this.handleError(error, req, res, 'before', name);
        return false;
      }
    }
    return true;
  }

  /**
   * Execute route-specific middleware
   */
  async executeRoute(routeKey, req, res) {
    const middleware = this.perRoute.get(routeKey);
    if (!middleware) return true;

    for (const mw of middleware) {
      try {
        const result = await mw(req, res);
        if (res.headersSent || result === false) {
          return false;
        }
      } catch (error) {
        await this.handleError(error, req, res, 'route', routeKey);
        return false;
      }
    }
    return true;
  }

  /**
   * Execute after middleware
   */
  async executeAfter(req, res, responseData) {
    for (const { name, middleware } of this.after) {
      try {
        await middleware(req, res, responseData);
      } catch (error) {
        console.error(`[After Middleware ${name}] Error:`, error);
      }
    }
  }

  /**
   * Handle error with error boundaries
   */
  async handleError(error, req, res, phase, name) {
    console.error(`[${phase}:${name}] Error:`, error);

    if (res.headersSent) return;

    // Try error handlers
    for (const handler of this.errorHandlers) {
      try {
        const handled = await handler(error, req, res);
        if (handled || res.headersSent) return;
      } catch (handlerError) {
        console.error('[Error Handler] Failed:', handlerError);
      }
    }

    // Default error response
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }));
    }
  }
}

