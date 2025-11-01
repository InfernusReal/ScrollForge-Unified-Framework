/**
 * Mesh Request Helpers
 * useRequest hook, RequestBoundary component, loader states
 */

export class RequestHelper {
  constructor(forgeFetch) {
    this.fetch = forgeFetch;
    this.activeRequests = new Map();
  }

  /**
   * useRequest hook for components
   */
  useRequest(url, options = {}) {
    const {
      immediate = true,
      transform,
      onSuccess,
      onError,
      cache,
      retry
    } = options;

    const state = {
      data: null,
      loading: immediate,
      error: null,
      refetch: null
    };

    const doFetch = async () => {
      state.loading = true;
      state.error = null;

      try {
        const response = await this.fetch.get(url, { cache, retry });
        state.data = transform ? transform(response.data) : response.data;
        
        if (onSuccess) onSuccess(state.data);
      } catch (error) {
        state.error = error;
        if (onError) onError(error);
      } finally {
        state.loading = false;
      }
    };

    state.refetch = doFetch;

    if (immediate) {
      doFetch();
    }

    return state;
  }

  /**
   * Create RequestBoundary component wrapper
   */
  createRequestBoundary(config) {
    const {
      loader = () => ({ tag: 'div', content: 'Loading...' }),
      error = (err) => ({ tag: 'div', content: `Error: ${err.message}` }),
      empty = () => ({ tag: 'div', content: 'No data' })
    } = config;

    return (requestState, renderFn) => {
      if (requestState.loading) {
        return loader();
      }

      if (requestState.error) {
        return error(requestState.error);
      }

      if (!requestState.data) {
        return empty();
      }

      return renderFn(requestState.data);
    };
  }

  /**
   * Defer state helper (stale-while-revalidate)
   */
  createDeferState(url, options = {}) {
    const state = {
      data: null,
      loading: false,
      stale: false,
      error: null
    };

    const fetchData = async (showStale = false) => {
      if (showStale && state.data) {
        state.stale = true;
      } else {
        state.loading = true;
      }

      try {
        const response = await this.fetch.get(url, options);
        state.data = response.data;
        state.stale = false;
        state.error = null;
      } catch (error) {
        state.error = error;
      } finally {
        state.loading = false;
      }
    };

    return {
      state,
      fetch: fetchData,
      refetch: () => fetchData(true) // Shows stale data while refetching
    };
  }

  /**
   * Subscription helper (WebSocket)
   */
  createSubscription(channel, options = {}) {
    const {
      onMessage,
      onConnect,
      onDisconnect,
      reconnect = true
    } = options;

    let ws = null;
    let reconnectAttempts = 0;
    const maxReconnects = 10;

    const connect = () => {
      const wsURL = channel.startsWith('ws') ? channel : `ws://localhost:3000${channel}`;
      ws = new WebSocket(wsURL);

      ws.onopen = () => {
        console.log(`[Subscription] Connected to ${channel}`);
        reconnectAttempts = 0;
        if (onConnect) onConnect();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (onMessage) onMessage(message);
        } catch (error) {
          console.error('[Subscription] Message parse error:', error);
        }
      };

      ws.onclose = () => {
        console.log(`[Subscription] Disconnected from ${channel}`);
        if (onDisconnect) onDisconnect();

        // Reconnect
        if (reconnect && reconnectAttempts < maxReconnects) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          setTimeout(connect, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('[Subscription] Error:', error);
      };
    };

    connect();

    return {
      send: (data) => {
        if (ws && ws.readyState === 1) {
          ws.send(JSON.stringify(data));
        }
      },
      close: () => {
        if (ws) {
          ws.close();
          ws = null;
        }
      }
    };
  }
}

export function createRequestHelper(forgeFetch) {
  return new RequestHelper(forgeFetch);
}

