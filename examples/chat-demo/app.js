/**
 * ScrollForge Chat Demo
 * Clean, working example with proper signal syncing
 */

import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
import { ScrollWeaveCore } from './node_modules/scrollforge/dist/weave-core.browser.js';
import { HTMLScrollMesh } from './node_modules/scrollforge/dist/mesh-full.browser.js';

console.log('🔥 ScrollForge Chat Loading...');

window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};

// Signals
app.Script.signal('messages', []);
app.Script.signal('connectionStatus', 'connecting');
app.Script.signal('username', '');
app.Script.signal('isLoggedIn', false);

// WebSocket (optional - works without server)
let ws;
try {
  ws = new WebSocket('ws://localhost:9000/ws');
  
  ws.onopen = () => {
    app.Script.set('connectionStatus', 'connected');
    console.log('✅ Connected to server');
  };
  
  ws.onerror = () => {
    app.Script.set('connectionStatus', 'error');
    console.log('❌ Server not running - offline mode');
  };
  
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'NEW_MESSAGE') {
      const messages = app.Script.get('messages');
      app.Script.set('messages', [...messages, msg.data.message]);
    }
  };
} catch (e) {
  app.Script.set('connectionStatus', 'error');
  console.log('ℹ️ Running in offline mode');
}

// Chat App
const ChatApp = HTMLScrollMesh(
  // UI
  ({ isLoggedIn, username, messages, connectionStatus }) => {
    if (!isLoggedIn) {
      return `
        <div class="chat-container">
          <div class="chat-header">
            <h1>🔥 ScrollForge Chat</h1>
            <p style="margin-top: 10px; font-size: 0.9rem;">Causal Graph Programming Demo</p>
            <div class="connection-status status-${connectionStatus}">
              ${connectionStatus === 'connected' ? '🟢 Connected' : 
                connectionStatus === 'connecting' ? '🟡 Connecting' : 
                '🔴 Offline Mode'}
            </div>
          </div>
          <div class="login-container">
            <h2 style="margin-bottom: 20px; color: #333;">Join Chat</h2>
            <input 
              class="login-input" 
              type="text" 
              placeholder="Enter username..."
              maxlength="20"
            />
            <br>
            <button class="login-button">Join</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="chat-container">
        <div class="chat-header">
          <h1>🔥 ScrollForge Chat</h1>
          <div class="connection-status status-${connectionStatus}">
            ${connectionStatus === 'connected' ? '🟢 Connected' : 
              connectionStatus === 'connecting' ? '🟡 Connecting' : 
              '🔴 Offline Mode'}
          </div>
        </div>
        
        <div class="messages-container">
          ${messages.length === 0 ? `
            <p style="text-align: center; color: #999; padding: 40px;">
              No messages yet. Send one below! 👇
            </p>
          ` : messages.map(msg => `
            <div class="message ${msg.username === username ? 'own' : 'other'}">
              <div class="message-avatar">
                ${msg.username.charAt(0).toUpperCase()}
              </div>
              <div class="message-content">
                <div class="message-username">
                  ${msg.username === username ? 'You' : msg.username}
                </div>
                <div class="message-text">
                  ${msg.text}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="input-container">
          <input 
            class="message-input" 
            type="text" 
            placeholder="Type a message..."
            maxlength="500"
          />
          <button class="send-button">Send</button>
        </div>
      </div>
    `;
  },
  
  // Weave
  (state, weave) => {
    weave.apply('.status-connected', {
      background: 'rgba(76, 175, 80, 0.3)'
    });
    
    weave.apply('.status-error', {
      background: 'rgba(244, 67, 54, 0.3)'
    });
  },
  
  // Logic
  (events, state) => {
    // Login (no input event!)
    events.on('click', '.login-button', () => {
      const input = document.querySelector('.login-input');
      const username = input ? input.value.trim() : '';
      
      if (!username) {
        alert('Please enter a username');
        return;
      }
      
      state.username = username;
      state.isLoggedIn = true;
      
      // Update global signals
      app.Script.set('username', username);
      app.Script.set('isLoggedIn', true);
      
      console.log(`✅ ${username} joined!`);
      
      // Send to server if connected
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'USER_JOIN',
          data: { username }
        }));
      }
    });
    
    events.on('keydown', '.login-input', (e) => {
      if (e.key === 'Enter') {
        document.querySelector('.login-button').click();
      }
    });
    
    // Send message (no input event!)
    events.on('click', '.send-button', () => {
      const input = document.querySelector('.message-input');
      const text = input ? input.value.trim() : '';
      
      if (!text) return;
      
      const messages = state.messages;
      const newMsg = {
        id: Date.now(),
        username: state.username,
        text,
        timestamp: new Date().toISOString()
      };
      
      state.messages = [...messages, newMsg];
      
      // Update global signal
      app.Script.set('messages', [...messages, newMsg]);
      
      // Clear input directly
      input.value = '';
      
      // Send to server if connected
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'SEND_MESSAGE',
          data: { username: state.username, text }
        }));
      }
    });
    
    events.on('keydown', '.message-input', (e) => {
      if (e.key === 'Enter') {
        document.querySelector('.send-button').click();
      }
    });
  },
  
  // Effects
  (state, effects) => {
    effects.when('messages', (messages) => {
      const container = document.querySelector('.messages-container');
      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 100);
      }
    });
  },
  
  // State
  () => ({
    isLoggedIn: false,
    username: '',
    messages: app.Script.get('messages'),
    connectionStatus: app.Script.get('connectionStatus')
  })
);

// ✅ THE FIX: Watch signals and update component state!
app.Script.watch('messages', (messages) => {
  ChatApp.state.messages = messages;
  ChatApp._render();
});

app.Script.watch('connectionStatus', (status) => {
  ChatApp.state.connectionStatus = status;
  ChatApp._render();
  console.log('🔄 Component state updated with connectionStatus:', status);
});

app.Script.watch('username', (username) => {
  ChatApp.state.username = username;
  ChatApp._render();
});

app.Script.watch('isLoggedIn', (isLoggedIn) => {
  ChatApp.state.isLoggedIn = isLoggedIn;
  ChatApp._render();
});

ChatApp.mount('#app');

console.log('✅ ScrollForge Chat Ready!');
console.log('Features: Auto-wiring, Reactive styling, Real-time updates');
console.log('Signal watchers: Syncing global signals with component state');
