/**
 * Action Pipeline Integration for Routes
 * guard → transform → commit → effect
 */

export class ActionPipeline {
  constructor(scriptInstance) {
    this.script = scriptInstance;
  }

  /**
   * Create route with full pipeline
   */
  createRoute(config) {
    const {
      guard,
      transform,
      commit,
      effect,
      rollback
    } = config;

    return async (req, res) => {
      let payload = { req, res, body: req.body, params: req.params, query: req.query };

      // Phase 1: Guard
      if (guard) {
        const allowed = await guard(payload);
        if (!allowed) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Forbidden' }));
          return;
        }
      }

      // Phase 2: Transform
      if (transform) {
        try {
          payload = await transform(payload);
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid data', details: error.message }));
          return;
        }
      }

      // Phase 3: Commit (state changes)
      let commitResult;
      const snapshot = this._createSnapshot();

      try {
        if (commit) {
          commitResult = await commit(payload, this.script);
        }
      } catch (error) {
        // Rollback on commit error
        if (rollback) {
          await rollback(snapshot, this.script);
        } else {
          this._restoreSnapshot(snapshot);
        }

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Commit failed', details: error.message }));
        return;
      }

      // Phase 4: Effects (side effects)
      if (effect) {
        // Effects run in background, don't block response
        setImmediate(async () => {
          try {
            await effect(commitResult, payload, this.script);
          } catch (error) {
            console.error('[Pipeline] Effect error:', error);
          }
        });
      }

      // Success response
      if (!res.headersSent) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: commitResult
        }));
      }
    };
  }

  /**
   * Create snapshot of all signals
   */
  _createSnapshot() {
    const signals = this.script.getAllSignals();
    const snapshot = new Map();

    signals.forEach((signal, name) => {
      if (!signal.derived) {
        snapshot.set(name, JSON.parse(JSON.stringify(signal.value)));
      }
    });

    return snapshot;
  }

  /**
   * Restore snapshot
   */
  _restoreSnapshot(snapshot) {
    snapshot.forEach((value, name) => {
      this.script.set(name, value);
    });
  }
}

/**
 * Pipeline builder helper
 */
export function pipeline(scriptInstance) {
  const actionPipeline = new ActionPipeline(scriptInstance);

  return {
    guard: (fn) => ({ guard: fn, _builder: true }),
    transform: (fn) => ({ transform: fn, _builder: true }),
    commit: (fn) => ({ commit: fn, _builder: true }),
    effect: (fn) => ({ effect: fn, _builder: true }),
    rollback: (fn) => ({ rollback: fn, _builder: true }),
    
    build: (...steps) => {
      const config = steps.reduce((acc, step) => ({ ...acc, ...step }), {});
      return actionPipeline.createRoute(config);
    }
  };
}

