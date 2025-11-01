/**
 * WebSocket Channels System
 * First-class WebSocket handling with broadcast, presence, replay
 */

import { WebSocketServer } from 'ws';

export class Channel {
  constructor(name, options = {}) {
    this.name = name;
    this.clients = new Set();
    this.presence = new Map(); // clientId -> userData
    this.messageLog = [];
    this.replayLimit = options.replayLimit || 0;
    this.handlers = new Map();
  }

  /**
   * Client joins channel
   */
  join(client, userData = {}) {
    this.clients.add(client);
    
    const clientId = client._scrollforgeId || this._generateId();
    client._scrollforgeId = clientId;
    client._channels = client._channels || new Set();
    client._channels.add(this.name);

    this.presence.set(clientId, {
      ...userData,
      joinedAt: Date.now()
    });

    // Send replay log
    if (this.replayLimit > 0) {
      const replayMessages = this.messageLog.slice(-this.replayLimit);
      client.send(JSON.stringify({
        type: 'REPLAY',
        channel: this.name,
        messages: replayMessages
      }));
    }

    // Broadcast presence update
    this.broadcast('PRESENCE_JOIN', {
      clientId,
      userData,
      totalClients: this.clients.size
    });

    return clientId;
  }

  /**
   * Client leaves channel
   */
  leave(client) {
    const clientId = client._scrollforgeId;
    
    this.clients.delete(client);
    this.presence.delete(clientId);

    if (client._channels) {
      client._channels.delete(this.name);
    }

    // Broadcast presence update
    this.broadcast('PRESENCE_LEAVE', {
      clientId,
      totalClients: this.clients.size
    });
  }

  /**
   * Broadcast message to all clients in channel
   */
  broadcast(event, data) {
    const message = {
      type: event,
      channel: this.name,
      data,
      timestamp: Date.now()
    };

    // Add to log
    if (this.replayLimit > 0) {
      this.messageLog.push(message);
      if (this.messageLog.length > this.replayLimit) {
        this.messageLog.shift();
      }
    }

    // Send to all clients
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  /**
   * Send to specific client
   */
  sendTo(clientId, event, data) {
    const client = Array.from(this.clients).find(c => c._scrollforgeId === clientId);
    
    if (client && client.readyState === 1) {
      client.send(JSON.stringify({
        type: event,
        channel: this.name,
        data,
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
    return this;
  }

  /**
   * Handle incoming message
   */
  async handleMessage(client, message) {
    const handlers = this.handlers.get(message.type);
    
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(message.data, client);
        } catch (error) {
          console.error(`[Channel ${this.name}] Handler error:`, error);
        }
      }
    }
  }

  /**
   * Get presence list
   */
  getPresence() {
    return Array.from(this.presence.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
  }

  /**
   * Generate ID
   */
  _generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class ChannelManager {
  constructor(server) {
    this.server = server;
    this.channels = new Map();
    this.wss = null;
  }

  /**
   * Create or get channel
   */
  channel(name, options = {}) {
    if (!this.channels.has(name)) {
      this.channels.set(name, new Channel(name, options));
    }
    return this.channels.get(name);
  }

  /**
   * Initialize WebSocket server
   */
  initializeWebSocket(httpServer, options = {}) {
    this.wss = new WebSocketServer({ 
      server: httpServer,
      path: options.path || '/ws'
    });

    this.wss.on('connection', (client) => {
      console.log('[Channels] Client connected');

      client.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Handle channel operations
          if (message.type === 'JOIN_CHANNEL') {
            const channel = this.channel(message.channel);
            channel.join(client, message.userData);
          } else if (message.type === 'LEAVE_CHANNEL') {
            const channel = this.channels.get(message.channel);
            if (channel) channel.leave(client);
          } else {
            // Route to channel handler
            const channel = this.channels.get(message.channel);
            if (channel) {
              await channel.handleMessage(client, message);
            }
          }
        } catch (error) {
          console.error('[Channels] Message error:', error);
        }
      });

      client.on('close', () => {
        // Remove from all channels
        if (client._channels) {
          client._channels.forEach(channelName => {
            const channel = this.channels.get(channelName);
            if (channel) channel.leave(client);
          });
        }
        console.log('[Channels] Client disconnected');
      });
    });

    console.log(`[Channels] WebSocket server ready on ${options.path || '/ws'}`);
  }

  /**
   * Broadcast to all channels
   */
  broadcastAll(event, data) {
    this.channels.forEach(channel => {
      channel.broadcast(event, data);
    });
  }

  /**
   * Get all channels
   */
  getChannels() {
    return Array.from(this.channels.keys());
  }
}

