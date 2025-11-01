/**
 * ScrollForge Full-Stack Demo - Client
 * Backend changes → Frontend auto-updates → Weave animates → Mesh renders!
 */

import ScrollForge from '../../src/index.js';
import { HTMLScrollMesh } from '../../src/mesh/html-context.js';

window.app = new ScrollForge({ debugMode: true });

console.log('== ScrollForge Full-Stack Client ==');

// ===== Setup ScrollFetch =====
app.Script.fetch.setBaseURL('http://localhost:3001');

// ===== Create Signals =====
app.Script.signal('users', []);
app.Script.signal('stats', { totalRequests: 0, activeUsers: 0 });
app.Script.signal('newUserName', '');
app.Script.signal('newUserEmail', '');

// ===== Fetch Initial Data =====
app.Script.fetch.reactiveGet('/api/users', 'users', {
  transform: (data) => data.users
});

app.Script.fetch.reactiveGet('/api/stats', 'stats', {
  interval: 2000, // Poll every 2 seconds
  transform: (data) => data.stats
});

// ===== Add User Form =====
const AddUserForm = HTMLScrollMesh(
  // HTML Template
  ({ name, email }) => `
    <div>
      <input 
        class="name-input" 
        placeholder="Name" 
        value="${name}"
      />
      <input 
        class="email-input" 
        placeholder="Email" 
        value="${email}"
      />
      <button class="add-btn">Add User</button>
    </div>
  `,
  
  // Logic
  (events, state) => {
    events.on('input', '.name-input', (e) => {
      state.name = e.target.value;
    });
    
    events.on('input', '.email-input', (e) => {
      state.email = e.target.value;
    });
    
    events.on('click', '.add-btn', async () => {
      if (!state.name || !state.email) {
        alert('Please fill all fields');
        return;
      }
      
      // POST to server
      const response = await app.Script.fetch.post('/api/users', {
        name: state.name,
        email: state.email
      });
      
      if (response.ok) {
        // Add to local state (server will also broadcast)
        const users = app.Script.get('users');
        app.Script.set('users', [...users, response.data.user]);
        
        // Clear form
        state.name = '';
        state.email = '';
        
        // Success animation
        app.Weave.spring('.add-btn', {
          transform: 'scale(1.2)',
          background: 'green'
        });
        
        setTimeout(() => {
          app.Weave.apply('.add-btn', {
            transform: 'scale(1)',
            background: '#667eea'
          });
        }, 500);
      }
    });
  },
  
  // State
  () => ({
    name: '',
    email: ''
  })
);

AddUserForm.mount('#add-user-form');

// ===== User List =====
const UserList = HTMLScrollMesh(
  // HTML Template
  ({ users }) => `
    <div>
      ${users.length === 0 ? '<p>No users yet</p>' : ''}
      ${users.map(user => `
        <div class="user-item user-${user.id}" data-id="${user.id}">
          <div>
            <strong>${user.name}</strong>
            <br />
            <small>${user.email}</small>
            <span style="margin-left: 1rem; color: ${user.active ? 'green' : 'gray'}">
              ${user.active ? '● Active' : '○ Inactive'}
            </span>
          </div>
          <button class="delete-btn" data-id="${user.id}">Delete</button>
        </div>
      `).join('')}
    </div>
  `,
  
  // ScrollWeave - Animate new users!
  (state, weave) => {
    // Fade in animation for new users
    state.users.forEach(user => {
      weave.fadeIn(`.user-${user.id}`, 300);
    });
  },
  
  // Logic
  (events, state) => {
    events.on('click', '.delete-btn', async (e) => {
      const id = parseInt(e.target.dataset.id);
      
      // Animate out
      app.Weave.fadeOut(`.user-${id}`, 300);
      
      // Wait for animation
      setTimeout(async () => {
        // DELETE request
        await app.Script.fetch.delete(`/api/users/${id}`);
        
        // Update local state
        const users = app.Script.get('users');
        app.Script.set('users', users.filter(u => u.id !== id));
      }, 300);
    });
  },
  
  // State synced with global signal
  () => ({
    users: app.Script.get('users')
  })
);

// Re-render when users change
app.Script.watch('users', () => {
  const users = app.Script.get('users');
  UserList.state.users = users;
  UserList._render();
});

UserList.mount('#user-list');

// ===== Stats Display =====
const StatsDisplay = HTMLScrollMesh(
  // HTML Template
  ({ totalRequests, activeUsers }) => `
    <div style="display: flex; gap: 2rem; justify-content: center;">
      <div class="stat-box" style="
        padding: 1rem 2rem;
        background: #667eea;
        color: white;
        border-radius: 8px;
        text-align: center;
      ">
        <div style="font-size: 2rem; font-weight: bold;">${totalRequests}</div>
        <div>Total Requests</div>
      </div>
      <div class="stat-box" style="
        padding: 1rem 2rem;
        background: #10b981;
        color: white;
        border-radius: 8px;
        text-align: center;
      ">
        <div style="font-size: 2rem; font-weight: bold;">${activeUsers}</div>
        <div>Active Users</div>
      </div>
    </div>
  `,
  
  // ScrollWeave - Animate on change
  (state, weave) => {
    if (state._lastRequests !== state.totalRequests) {
      weave.spring('.stat-box', {
        transform: 'scale(1.1)'
      });
      
      setTimeout(() => {
        weave.apply('.stat-box', {
          transform: 'scale(1)'
        });
      }, 300);
      
      state._lastRequests = state.totalRequests;
    }
  },
  
  // State synced with global
  () => ({
    totalRequests: app.Script.get('stats').totalRequests,
    activeUsers: app.Script.get('stats').activeUsers,
    _lastRequests: 0
  })
);

// Update stats display
app.Script.watch('stats', () => {
  const stats = app.Script.get('stats');
  StatsDisplay.state.totalRequests = stats.totalRequests;
  StatsDisplay.state.activeUsers = stats.activeUsers;
  StatsDisplay._render();
});

StatsDisplay.mount('#stats');

console.log('\n[ok] Full-Stack Client Loaded!');
console.log('\nTry:');
console.log('  1. Add a user (auto-syncs to server)');
console.log('  2. Delete a user (animates, then syncs)');
console.log('  3. Watch stats update in real-time');
console.log('  4. Open in another tab - see changes sync!');
console.log('\nThe Flow:');
console.log('  Backend changes → ScrollScript signal updates');
console.log('                 → ScrollWeave animates');
console.log('                 → ScrollMesh re-renders');
console.log('  AUTOMATIC! ✨');

