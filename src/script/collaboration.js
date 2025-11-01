/**
 * Collaboration Loop
 * Server emit → Client auto-dispatch → Mesh rerender
 */

export class CollaborationLoop {
  constructor(scriptInstance, channelManager) {
    this.script = scriptInstance;
    this.channels = channelManager;
    this.eventContract = new Map();
  }

  /**
   * Register event contract
   */
  register(eventName, handler) {
    this.eventContract.set(eventName, handler);
    return this;
  }

  /**
   * Server-side: Emit event through channel
   */
  emit(channelName, eventName, payload) {
    const channel = this.channels.channel(channelName);
    
    // Broadcast to all clients in channel
    channel.broadcast(eventName, payload);

    // Also trigger local action
    this.script.trigger(eventName, payload);
  }

  /**
   * Client-side: Subscribe to channel events
   */
  subscribe(channelName, eventMap, options = {}) {
    if (typeof window === 'undefined') {
      throw new Error('subscribe() is client-side only');
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = options.host || window.location.host;
    const path = options.path || '/ws';
    const wsURL = options.url || `${protocol}//${host}${path}`;
    const ws = new WebSocket(wsURL, options.protocols);

    ws.onopen = () => {
      // Join channel
      ws.send(JSON.stringify({
        type: 'JOIN_CHANNEL',
        channel: channelName
      }));

      if (options.userData) {
        ws.send(JSON.stringify({
          type: 'UPDATE_PRESENCE',
          channel: channelName,
          data: options.userData
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Auto-dispatch to ScrollScript action
        if (eventMap[message.type]) {
          const actionType = eventMap[message.type];
          this.script.trigger(actionType, message.data);
        }

        // Call contract handler if registered
        const handler = this.eventContract.get(message.type);
        if (handler) {
          handler(message.data);
        }
      } catch (error) {
        console.error('[Collaboration] Message error:', error);
      }
    };

    const subscription = {
      send: (eventName, data) => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({
            type: eventName,
            channel: channelName,
            data
          }));
        }
      },
      close: () => ws.close()
    };

    return subscription;
  }

  /**
   * Presence tracking
   */
  trackPresence(channelName, userData = {}) {
    if (typeof window === 'undefined') return;

    const subscription = this.subscribe(channelName, {
      'PRESENCE_JOIN': 'USER_JOINED',
      'PRESENCE_LEAVE': 'USER_LEFT'
    });

    // Send user data
    subscription.send('UPDATE_PRESENCE', userData);

    return subscription;
  }

  /**
   * Collaborative signal - syncs across all clients
   */
  collaborativeSignal(signalName, initialValue, channelName = 'default') {
    // Create signal
    this.script.signal(signalName, initialValue);

    if (typeof window !== 'undefined') {
      let suppress = false;

      const clientAction = `COLLAB_${signalName.toUpperCase()}_APPLY`;
      const subscription = this.subscribe(channelName, {
        [`${signalName}_UPDATED`]: clientAction
      });

      // Client-side: Subscribe to updates
      this.script.action(clientAction, (payload) => {
        suppress = true;
        this.script.set(signalName, payload);
        suppress = false;
      });

      // Watch local changes and broadcast
      this.script.watch(signalName, (value) => {
        if (suppress) return;
        if (subscription && subscription.send) {
          subscription.send(`${signalName}_UPDATED`, value);
        }
      });

      return subscription;
    } else {
      // Server-side: Broadcast changes
      this.script.watch(signalName, (value) => {
        this.emit(channelName, `${signalName}_UPDATED`, value);
      });
    }
  }
}

export function createCollaborationLoop(scriptInstance, channelManager) {
  return new CollaborationLoop(scriptInstance, channelManager);
}

