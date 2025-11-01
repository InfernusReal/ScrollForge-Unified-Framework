# 🔥 ScrollForge Code Snippets

**Copy-paste ready examples showing what makes ScrollForge special**

---

## ⚡ **1. The Simplest Counter Ever**

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

HTMLScrollMesh(
  ({ count }) => `<button>${count}</button>`,
  (events, state) => events.on('click', 'button', () => state.count++),
  () => ({ count: 0 })
).mount('#app');
```

**3 lines. Full reactive counter. Done.** ✨

---

## 🎨 **2. Conditional Styling (The Magic)**

```javascript
import ScrollForge from 'scrollforge';

const app = new ScrollForge();

app.Script.signal('isActive', false);

// CSS that responds to state!
app.Script.watch('isActive', (isActive) => {
  if (isActive) {
    app.Weave.apply('.button', {
      background: 'green',
      padding: '20px',
      transform: 'scale(1.1)',
      boxShadow: '0 8px 16px rgba(0,255,0,0.3)'
    });
  } else {
    app.Weave.apply('.button', {
      background: 'gray',
      padding: '10px',
      transform: 'scale(1)',
      boxShadow: 'none'
    });
  }
});

// Change state → styles update automatically!
app.Script.set('isActive', true);
```

---

## 🔄 **3. Two-Way Data Binding**

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

// Global signal
app.Script.signal('user', { email: '', password: '' });

// Component syncs automatically!
const LoginForm = app.Mesh.component('LoginForm', {
  sync: {
    email: 'user.email',       // Local ↔ Global
    password: 'user.password'
  },
  
  render({ email, password }) {
    return {
      tag: 'form',
      children: [
        {
          tag: 'input',
          attrs: { type: 'email', value: email },
          events: {
            input: (e) => {
              this.state.email = e.target.value;
              // Global signal auto-updates! ✨
            }
          }
        }
      ]
    };
  }
});
```

---

## 🕐 **4. Time-Travel (Undo/Redo)**

```javascript
const Editor = app.Mesh.component('Editor', {
  state: { text: '' },
  history: true, // One flag = time-travel!
  
  render({ text }) {
    return {
      tag: 'div',
      children: [
        { tag: 'textarea', attrs: { value: text }, events: {
          input: (e) => this.state.text = e.target.value
        }},
        { tag: 'button', content: 'Undo', events: {
          click: () => this.undo() // Built-in!
        }},
        { tag: 'button', content: 'Redo', events: {
          click: () => this.redo()
        }}
      ]
    };
  }
});
```

---

## 🗃️ **5. Query Your State Like SQL**

```javascript
app.Script.signal('users', [
  { id: 1, name: 'John', active: true, role: 'admin' },
  { id: 2, name: 'Jane', active: false, role: 'user' },
  { id: 3, name: 'Bob', active: true, role: 'user' }
]);

const ActiveUsers = app.Mesh.component('ActiveUsers', {
  query: {
    from: 'users',              // FROM users
    where: u => u.active,       // WHERE active = true
    orderBy: 'name',            // ORDER BY name
    limit: 10                   // LIMIT 10
  },
  
  render({ results }) {
    // Auto-updates when 'users' changes!
    return results.map(u => ({
      tag: 'div',
      content: `${u.name} (${u.role})`
    }));
  }
});
```

---

## 🌐 **6. Full-Stack in 20 Lines**

**Server:**
```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate();

server.signal('count', 0);
server.autoSync('count'); // Broadcasts to all clients!

server.post('/increment', (req, res) => {
  server.set('count', server.get('count') + 1);
  // All clients receive update automatically! ✨
  server.json(res, { count: server.get('count') });
});

server.listen(3000);
```

**Client:**
```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

window.app = new (await import('scrollforge')).default();
app.Script.signal('count', 0);

HTMLScrollMesh(
  ({ count }) => `<button>${count}</button>`,
  (events) => events.on('click', 'button', async () => {
    await app.Script.fetch.post('http://localhost:3000/increment');
  }),
  () => ({ count: app.Script.get('count') })
).mount('#app');

// Watch for server updates
app.Script.watch('count', render);
```

**Real-time sync. All automatic!** ✨

---

## 🤝 **7. Collaborative Cursors (Figma-Style)**

```javascript
// Server
const cursors = server.channel('cursors');
cursors.on('CURSOR_MOVE', (data) => {
  cursors.broadcast('CURSOR_UPDATE', data);
});

// Client
app.Script.signal('cursors', {});

app.Script.collaboration.subscribe('cursors', {
  'CURSOR_UPDATE': 'UPDATE_CURSOR'
});

app.Script.action('UPDATE_CURSOR', (payload) => {
  const cursors = app.Script.get('cursors');
  cursors[payload.userId] = { x: payload.x, y: payload.y };
  app.Script.set('cursors', { ...cursors });
});

// Track own cursor
app.Script.onPointer('CURSOR_MOVED');
app.Script.action('CURSOR_MOVED', ({ x, y }) => {
  // Send to all users
  subscription.send('CURSOR_MOVE', {
    userId: 'me',
    x, y
  });
});

// Render all cursors
const Cursors = HTMLScrollMesh(
  ({ cursors }) => `
    ${Object.entries(cursors).map(([id, pos]) => `
      <div class="cursor" style="
        position: fixed;
        left: ${pos.x}px;
        top: ${pos.y}px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: hsl(${id.charCodeAt(0) * 30}, 70%, 50%);
        pointer-events: none;
      "></div>
    `).join('')}
  `,
  () => ({ cursors: app.Script.get('cursors') })
);

app.Script.watch('cursors', () => Cursors._render());
```

**Multiplayer cursors in 40 lines!** 🤯

---

## 📊 **8. Real-Time Dashboard**

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

// Live data from server (polls every 2s)
app.Script.net.liveQuery('/api/stats', 'stats', {
  interval: 2000,
  transform: (data) => data.stats
});

const Dashboard = HTMLScrollMesh(
  ({ stats }) => `
    <div class="dashboard">
      <div class="stat-card">
        <h2>${stats.users}</h2>
        <p>Active Users</p>
      </div>
      <div class="stat-card">
        <h2>${stats.revenue}</h2>
        <p>Revenue</p>
      </div>
      <div class="stat-card">
        <h2>${stats.requests}</h2>
        <p>Requests</p>
      </div>
    </div>
  `,
  
  (state, weave) => {
    // Animate on data change
    weave.spring('.stat-card', {
      transform: 'scale(1.05)'
    });
    
    setTimeout(() => {
      weave.apply('.stat-card', {
        transform: 'scale(1)'
      });
    }, 300);
  },
  
  () => ({ stats: app.Script.get('stats') })
);

app.Script.watch('stats', () => {
  Dashboard.state.stats = app.Script.get('stats');
  Dashboard._render();
});
```

**Auto-updating, animated dashboard!** 📈

---

## 🎮 **9. State Transactions (All or Nothing)**

```javascript
HTMLScrollMesh(
  (events, state) => {
    events.on('click', '.transfer-btn', () => {
      state.transaction(() => {
        // Either ALL succeed or ALL rollback
        state.accountA -= 100;
        state.accountB += 100;
        state.transactionLog.push({
          from: 'A',
          to: 'B',
          amount: 100,
          timestamp: Date.now()
        });
        
        if (state.accountA < 0) {
          throw new Error('Insufficient funds');
          // Automatically rolls back all changes!
        }
      });
    });
  },
  
  () => ({
    accountA: 1000,
    accountB: 500,
    transactionLog: []
  })
);
```

---

## 🎯 **10. Computed Properties**

```javascript
ScrollMesh(
  ({ fullName, age, isAdult }) => `
    <div>
      <p>Name: ${fullName}</p>
      <p>Age: ${age}</p>
      <p>Status: ${isAdult ? 'Adult' : 'Minor'}</p>
    </div>
  `,
  
  () => ({
    firstName: 'John',
    lastName: 'Doe',
    birthYear: 1990,
    
    computed: {
      fullName: (state) => `${state.firstName} ${state.lastName}`,
      age: (state) => new Date().getFullYear() - state.birthYear,
      isAdult: (state) => {
        const age = new Date().getFullYear() - state.birthYear;
        return age >= 18;
      }
    }
  })
);

// Change firstName → fullName auto-updates!
```

---

## 🔒 **11. Built-in Validation**

```javascript
ScrollMesh(
  () => ({
    email: '',
    age: 0,
    
    validate: {
      email: (value) => /\S+@\S+\.\S+/.test(value) || 'Invalid email',
      age: (value) => value >= 18 || 'Must be 18 or older'
    }
  })
);

// Try to set invalid value
state.email = 'invalid'; // Console error + rejected!
state.email = 'valid@email.com'; // ✅ Accepted
```

---

## ⚡ **12. Optimistic Updates**

```javascript
const usersAPI = app.Script.fetch.resource('users', '/api/users');

// Create user
await usersAPI.create({
  name: 'John',
  email: 'john@example.com'
}, true); // optimistic = true

// UI updates IMMEDIATELY (before server responds)
// If server fails → auto-rollback
// If server succeeds → replace with real data
```

---

## 🌊 **13. Action Pipelines (Backend)**

```javascript
server.post('/api/users', server.pipeline()
  .guard((payload) => {
    // Authentication check
    return payload.req.headers.authorization === 'Bearer valid-token';
  })
  .transform((payload) => ({
    ...payload,
    body: {
      ...payload.req.body,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
  }))
  .commit((payload, script) => {
    // Update database/state
    const users = script.get('users');
    script.set('users', [...users, payload.body]);
    return payload.body;
  })
  .effect((user) => {
    // Side effects (email, analytics)
    console.log('User created:', user);
    sendWelcomeEmail(user.email);
  })
  .build()
);
```

---

## 📡 **14. WebSocket Channels**

**Server:**
```javascript
const chat = server.channel('chat', {
  replayLimit: 50 // Last 50 messages
});

chat.on('MESSAGE', (data, client) => {
  // Broadcast to all in channel
  chat.broadcast('NEW_MESSAGE', {
    user: data.user,
    text: data.text,
    timestamp: Date.now()
  });
});

// Presence tracking
const presence = chat.getPresence();
console.log(`${presence.length} users online`);
```

**Client:**
```javascript
const subscription = app.Script.collaboration.subscribe('chat', {
  'NEW_MESSAGE': 'RECEIVE_MESSAGE'
});

app.Script.action('RECEIVE_MESSAGE', (payload) => {
  const messages = app.Script.get('messages');
  app.Script.set('messages', [...messages, payload]);
  // Component auto-re-renders!
});

// Send message
subscription.send('MESSAGE', {
  user: 'John',
  text: 'Hello everyone!'
});
```

---

## 🎭 **15. Mix HTML and JavaScript**

```javascript
HTMLScrollMesh(
  ({ mode, count }) => {
    // Switch modes dynamically!
    if (mode === 'html') {
      return `<button class="btn">${count}</button>`;
    } else {
      return {
        tag: 'button',
        attrs: { class: 'btn' },
        content: count
      };
    }
  },
  
  (events, state) => {
    events.on('click', '.btn', () => {
      state.count++;
      state.mode = state.mode === 'html' ? 'js' : 'html';
    });
  },
  
  () => ({ count: 0, mode: 'html' })
);
```

**Switch rendering modes on the fly!** 🔥

---

## 🌐 **16. Network-Reactive UI**

```javascript
import { createNetworkReactivity } from 'scrollforge/weave';

const netReactivity = createNetworkReactivity(app.Weave, app.Script);
netReactivity.setup();

// UI auto-responds to network status!

// Go offline → Body grayscales automatically
// Go online → Color returns
// Loading → Loading bar appears
// Error → Page shakes
// High latency → Warning shows

// Custom rules
netReactivity.when('net.status === "offline"', {
  'body': { filter: 'grayscale(100%)', opacity: '0.7' },
  '.offline-msg': { display: 'block' }
});

netReactivity.when('net.latency > 1000', {
  '.slow-warning': { display: 'block', color: 'orange' }
});
```

**UI adapts to network conditions automatically!** 📡

---

## 💫 **17. Spring Animations**

```javascript
// Click button → smooth spring animation
app.Script.action('ACTIVATE', () => {
  app.Script.set('isActive', true);
  
  app.Weave.spring('.card', {
    transform: 'translateY(0) scale(1)',
    opacity: 1
  }, {
    stiffness: 200,
    damping: 20,
    mass: 1
  });
});

// Physics-based, smooth, GPU-accelerated!
```

---

## 🎯 **18. Middleware on Server**

```javascript
// Before middleware
server.before('logging', (req, res) => {
  console.log(`→ ${req.method} ${req.url}`);
});

server.before('auth', (req, res) => {
  if (!req.headers.authorization) {
    server.json(res, { error: 'Unauthorized' }, 401);
    return false; // Stop pipeline
  }
});

// After middleware
server.after('timing', (req, res) => {
  console.log(`← ${res.statusCode}`);
});

// Error boundary
server.errorBoundary((error, req, res) => {
  console.error('Error:', error);
  server.json(res, { error: 'Server error' }, 500);
  return true; // Handled
});
```

---

## 🚀 **19. Auto-Wire Unlimited Functions**

```javascript
ScrollMesh(
  // Function 1: UI
  ({ count, user, theme }) => `
    <div class="${theme}">
      <h1>${user.name}</h1>
      <p>${count}</p>
    </div>
  `,
  
  // Function 2: Styling
  (state, weave) => {
    weave.apply('div', {
      background: state.theme === 'dark' ? '#000' : '#fff'
    });
  },
  
  // Function 3: Logic
  (events, state) => {
    events.on('click', 'button', () => state.count++);
  },
  
  // Function 4: State
  () => ({
    count: 0,
    user: { name: 'John' },
    theme: 'light'
  }),
  
  // Function 5: Effects
  (state, effects) => {
    effects.when('count', (count) => {
      console.log('Count changed:', count);
    });
  },
  
  // Function 6: API calls
  (state, api) => {
    api.when('user.id', async (id) => {
      const res = await api.fetch(`/api/users/${id}`);
      state.user = await res.json();
    });
  },
  
  // Function 7: Analytics
  (state, analytics) => {
    analytics.track('pageView', () => state.count);
  }
  
  // ... ADD AS MANY AS YOU WANT!
  // All auto-connect! ✨
);
```

---

## 💾 **20. Reactive API with Retry**

```javascript
// Setup
app.Script.fetch.setBaseURL('http://localhost:3000');

// Reactive GET with auto-retry
app.Script.net.liveQuery('/api/users', 'users', {
  interval: 5000,        // Poll every 5s
  transform: (data) => data.users,
  cache: { ttl: 3000 },  // Cache 3s
  retry: {
    attempts: 3,
    backoff: 'exponential' // 1s, 2s, 4s
  }
});

// Signal auto-updates!
app.Script.watch('users', (users) => {
  console.log('Users updated:', users);
  // Component auto-re-renders!
});
```

---

## 🎨 **21. Theme Switching**

```javascript
app.Weave.theme('dark', {
  background: '#1a1a1a',
  text: '#ffffff',
  primary: '#667eea'
});

app.Weave.theme('light', {
  background: '#ffffff',
  text: '#333333',
  primary: '#667eea'
});

// Switch with animation
app.Script.action('TOGGLE_THEME', () => {
  const current = app.Script.get('theme');
  const next = current === 'dark' ? 'light' : 'dark';
  
  app.Weave.applyTheme(next);
  app.Script.set('theme', next);
});

// Smooth transition between themes!
```

---

## 🔍 **22. Visual Debugger**

```javascript
const Counter = app.Mesh.component('Counter', {
  debug: true, // One flag!
  state: { count: 0 },
  
  render({ count }) {
    return { tag: 'button', content: count };
  }
});

// Press Ctrl+Shift+D
// See:
// - Component name
// - Current state: { count: 0 }
// - Dependencies: []
// - Render count: 23
// - Avg time: 1.2ms
// - Last time: 1.5ms
// - FPS: ~60
```

---

## 🎪 **23. Nested Routers (Backend)**

```javascript
// Users router
const usersRouter = server.createRouter();
usersRouter.get('/', getAllUsers);
usersRouter.get('/:id', getUser);
usersRouter.post('/', createUser);

// Admin router
const adminRouter = server.createRouter();
adminRouter.get('/dashboard', getDashboard);
adminRouter.get('/users', getAllUsersAdmin);

// Nest routers
server.use('/api/users', usersRouter);
server.use('/admin', adminRouter);

// Results in:
// GET  /api/users       → getAllUsers
// GET  /api/users/:id   → getUser
// POST /api/users       → createUser
// GET  /admin/dashboard → getDashboard
```

---

## 🔄 **24. Request Caching**

```javascript
// Cached request
const response = await app.Script.fetch.get('/api/users', {
  cache: { ttl: 60000 } // Cache for 1 minute
});

// Second call within 1 minute = instant (from cache)
const cached = await app.Script.fetch.get('/api/users', {
  cache: { ttl: 60000 }
});

// Clear cache
app.Script.fetch.clearCache('/api/users');

// Or clear all
app.Script.fetch.clearCache();
```

---

## 🎬 **25. The Complete Flow (30 Lines)**

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';
import { ScrollScriptServerUltimate } from 'scrollforge/script';

// SERVER
const server = new ScrollScriptServerUltimate();
server.signal('count', 0);
server.autoSync('count');
server.post('/inc', (req, res) => {
  server.set('count', server.get('count') + 1);
  server.json(res, { count: server.get('count') });
});
server.listen(3000);

// CLIENT
window.app = new (await import('scrollforge')).default();
app.Script.fetch.setBaseURL('http://localhost:3000');
app.Script.signal('count', 0);

HTMLScrollMesh(
  ({ count }) => `
    <div style="text-align: center;">
      <h1 class="count">${count}</h1>
      <button class="btn">Click Me</button>
    </div>
  `,
  (state, weave) => {
    weave.when('.count', state.count > 5,
      { color: 'green', fontSize: '4rem' },
      { color: 'blue', fontSize: '2rem' }
    );
  },
  (events) => events.on('click', '.btn', async () => {
    await app.Script.fetch.post('/inc');
  }),
  () => ({ count: app.Script.get('count') })
).mount('#app');

app.Script.watch('count', render);

// Backend updates → Frontend animates → Mesh renders!
// AUTOMATIC! ✨
```

---

## 🔥 **WHY THESE SNIPPETS MATTER:**

**Each one shows something UNIQUE:**

1. ✅ Simplicity (3-line counter)
2. ✅ Reactive styling (CSS responds to state)
3. ✅ Two-way binding (auto-sync)
4. ✅ Time-travel (built-in undo/redo)
5. ✅ SQL-like queries (filter, sort, limit)
6. ✅ Full-stack (20 lines total!)
7. ✅ Collaboration (multiplayer cursors)
8. ✅ Real-time (auto-updating dashboard)
9. ✅ Transactions (atomic updates)
10. ✅ Computed (auto-updating values)
11. ✅ Validation (runtime checks)
12. ✅ Optimistic updates (instant UI)
13. ✅ Pipelines (guard → commit flow)
14. ✅ Channels (broadcast, presence)
15. ✅ Mixed modes (HTML + JS)
16. ✅ Network reactivity (offline detection)
17. ✅ Spring physics (smooth animations)
18. ✅ Middleware (before/after hooks)
19. ✅ Auto-wiring (unlimited functions)
20. ✅ Advanced HTTP (retry, cache)

**NO OTHER FRAMEWORK CAN DO ALL OF THIS!** 💎

---

🔥 **ScrollForge - Code That Speaks For Itself!** 🔥

