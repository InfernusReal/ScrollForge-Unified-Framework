/**
 * ScrollForge Ultimate Full-Stack Client
 * THE COMPLETE FLOW:
 * Backend Request → ScrollScript → ScrollWeave → ScrollMesh → Render!
 */

import ScrollForge from '../../src/index.js';
import { HTMLScrollMesh } from '../../src/mesh/html-context.js';
import { createNetworkReactivity } from '../../src/weave/network-reactivity.js';

window.app = new ScrollForge({ debugMode: true});

console.log('== ScrollForge Ultimate Client ==\n');

// ===== Setup ForgeFetch =====
app.Script.fetch.setBaseURL('http://localhost:3001');

// ===== Setup Network Reactivity =====
const netReactivity = createNetworkReactivity(app.Weave, app.Script);
netReactivity.setup();

// Custom network rule
netReactivity.when('net.status === "offline"', {
  'body': { filter: 'grayscale(100%)', opacity: '0.7' }
});

// ===== Network Status Display =====
const NetworkStatus = HTMLScrollMesh(
  ({ status, loading, latency }) => `
    <div>
      <div class="status-indicator ${status === 'online' ? 'status-online' : 'status-offline'}">
        ${status === 'online' ? '● Online' : '○ Offline'}
      </div>
      ${loading ? '<div>Loading...</div>' : ''}
      ${latency > 0 ? `<div>Latency: ${latency}ms</div>` : ''}
    </div>
  `,
  
  () => ({
    status: app.Script.get('net.status'),
    loading: app.Script.get('net.loading'),
    latency: app.Script.get('net.latency')
  })
);

// Watch network signals
['net.status', 'net.loading', 'net.latency'].forEach(sig => {
  app.Script.watch(sig, () => {
    NetworkStatus.state.status = app.Script.get('net.status');
    NetworkStatus.state.loading = app.Script.get('net.loading');
    NetworkStatus.state.latency = app.Script.get('net.latency');
    NetworkStatus._render();
  });
});

NetworkStatus.mount('#net-status');

// Also show in top-right corner
app.Script.watch('net.status', (status) => {
  const indicator = document.getElementById('network-status');
  indicator.textContent = status === 'online' ? '● Online' : '○ Offline';
  indicator.className = status === 'online' ? 'network-status status-online' : 'network-status status-offline';
});

// ===== Users with Reactive Query =====
app.Script.signal('users', []);

// Reactive GET - auto-updates users signal
app.Script.net.liveQuery('/api/users', 'users', {
  transform: (data) => data.users,
  interval: 5000, // Poll every 5 seconds
  cache: { ttl: 3000 }
});

const UserList = HTMLScrollMesh(
  ({ users }) => `
    <div>
      ${users.length === 0 ? '<p>No users</p>' : ''}
      ${users.map(user => `
        <div class="user-item" data-id="${user.id}">
          <strong>${user.name}</strong> - ${user.email}
          <button class="delete-user" data-id="${user.id}">Delete</button>
        </div>
      `).join('')}
    </div>
  `,
  
  // ScrollWeave - Animate users!
  (state, weave) => {
    state.users.forEach(user => {
      weave.fadeIn(`.user-item[data-id="${user.id}"]`, 300);
    });
  },
  
  // Logic
  (events, state) => {
    events.on('click', '.delete-user', async (e) => {
      const id = parseInt(e.target.dataset.id);
      
      // Optimistic delete with animation
      app.Weave.fadeOut(`.user-item[data-id="${id}"]`, 300);
      
      setTimeout(async () => {
        try {
          // DELETE to server
          await app.Script.fetch.delete(`/api/users/${id}`, {
            retry: { attempts: 3, backoff: 'exponential' }
          });
          
          // Update local state
          const users = app.Script.get('users');
          app.Script.set('users', users.filter(u => u.id !== id));
        } catch (error) {
          console.error('Delete failed:', error);
          alert('Failed to delete user');
        }
      }, 300);
    });
  },
  
  () => ({
    users: app.Script.get('users')
  })
);

app.Script.watch('users', () => {
  UserList.state.users = app.Script.get('users');
  UserList._render();
});

UserList.mount('#user-list');

// ===== Add User Form =====
const AddUserForm = HTMLScrollMesh(
  ({ name, email }) => `
    <div>
      <input class="name-input" placeholder="Name" value="${name}" />
      <input class="email-input" placeholder="Email" value="${email}" />
      <button class="add-user-btn">Add User</button>
    </div>
  `,
  
  (events, state) => {
    events.on('input', '.name-input', (e) => {
      state.name = e.target.value;
    });
    
    events.on('input', '.email-input', (e) => {
      state.email = e.target.value;
    });
    
    events.on('click', '.add-user-btn', async () => {
      if (!state.name || !state.email) {
        alert('Fill all fields');
        return;
      }
      
      try {
        // POST with retry and caching
        const response = await app.Script.fetch.post('/api/users', {
          name: state.name,
          email: state.email
        }, {
          retry: { attempts: 3, backoff: 'exponential' },
          headers: { 'Authorization': 'Bearer valid-token' }
        });
        
        if (response.ok) {
          // Success animation
          app.Weave.spring('.add-user-btn', {
            background: 'green',
            transform: 'scale(1.1)'
          });
          
          setTimeout(() => {
            app.Weave.apply('.add-user-btn', {
              background: '#667eea',
              transform: 'scale(1)'
            });
          }, 500);
          
          // Clear form
          state.name = '';
          state.email = '';
          
          // Server will broadcast update to all clients!
        }
      } catch (error) {
        console.error('Add user failed:', error);
        
        // Error animation
        app.Weave.animate('.add-user-btn', [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(0)' }
        ], { duration: 300 });
        
        alert('Failed to add user');
      }
    });
  },
  
  () => ({
    name: '',
    email: ''
  })
);

AddUserForm.mount('#add-user');

// ===== Collaborative Chat =====
app.Script.signal('messages', []);

// Subscribe to chat channel
const chatSub = app.Script.collaboration?.subscribe('chat', {
  'MESSAGE': 'CHAT_MESSAGE_RECEIVED'
}) || { send: () => {}, close: () => {} };

// Handle incoming messages
app.Script.action('CHAT_MESSAGE_RECEIVED', (payload) => {
  const messages = app.Script.get('messages');
  app.Script.set('messages', [...messages, payload]);
});

const Chat = HTMLScrollMesh(
  ({ messages, newMessage }) => `
    <div>
      <div style="max-height: 200px; overflow-y: auto; margin-bottom: 1rem; padding: 0.5rem; background: white; border-radius: 5px;">
        ${messages.map(msg => `
          <div style="margin: 0.5rem 0;">
            <strong>${msg.user}:</strong> ${msg.text}
            <br />
            <small style="color: #999;">${new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        `).join('')}
      </div>
      <input class="message-input" placeholder="Type message..." value="${newMessage}" />
      <button class="send-btn">Send</button>
    </div>
  `,
  
  (events, state) => {
    events.on('input', '.message-input', (e) => {
      state.newMessage = e.target.value;
    });
    
    events.on('click', '.send-btn', () => {
      if (!state.newMessage.trim()) return;
      
      // Send to server channel
      chatSub.send('MESSAGE', {
        text: state.newMessage,
        user: 'Anonymous'
      });
      
      state.newMessage = '';
    });
    
    events.on('keydown', '.message-input', (e) => {
      if (e.key === 'Enter') {
        document.querySelector('.send-btn').click();
      }
    });
  },
  
  () => ({
    messages: app.Script.get('messages'),
    newMessage: ''
  })
);

app.Script.watch('messages', () => {
  Chat.state.messages = app.Script.get('messages');
  Chat._render();
  
  // Scroll to bottom
  const chatBox = document.querySelector('.chat-box');
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

Chat.mount('#chat');

console.log('\n[ok] Ultimate Client Loaded!\n');
console.log('THE COMPLETE FLOW:');
console.log('  1. Click button (frontend)');
console.log('  2. ForgeFetch POSTs to server');
console.log('  3. Server updates signal');
console.log('  4. Signal auto-syncs to ALL clients');
console.log('  5. ScrollScript receives update');
console.log('  6. ScrollWeave animates change');
console.log('  7. ScrollMesh re-renders');
console.log('  8. Smooth, real-time, collaborative!');
console.log('\nFeatures:');
console.log('  ✅ Reactive queries (auto-fetch)');
console.log('  ✅ Optimistic updates');
console.log('  ✅ Retry with exponential backoff');
console.log('  ✅ Request caching');
console.log('  ✅ Network status monitoring');
console.log('  ✅ Offline detection');
console.log('  ✅ Real-time WebSocket');
console.log('  ✅ Collaborative features');
console.log('  ✅ Auto-animations on updates');

