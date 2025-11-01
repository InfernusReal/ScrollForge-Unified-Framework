# 🔥 ScrollForge Full-Stack Magic

## **Backend Request → Frontend Auto-Updates → Weave Animates → Mesh Renders**

**ALL AUTOMATIC!** ✨

---

## 🎯 **THE FLOW:**

```
1. User clicks button (frontend)
      ↓
2. ScrollFetch POSTs to server
      ↓
3. Server updates signal
      ↓
4. Signal auto-syncs to ALL clients
      ↓
5. Frontend ScrollScript receives update
      ↓
6. ScrollWeave animates the change
      ↓
7. ScrollMesh re-renders component
      ↓
8. User sees smooth, animated update
```

**ZERO manual wiring needed!**

---

## 🚀 **NEW BACKEND FEATURES:**

### **ScrollScript Server is now INSANE:**

#### **1. Route Params** (`/users/:id`)
```javascript
server.get('/api/users/:id', 'FETCH_USER', (req, res) => {
  const id = req.params.id; // Automatically extracted!
  const user = users.find(u => u.id === id);
  server.json(res, { user });
});
```

#### **2. Auto Body Parsing**
```javascript
server.post('/api/users', 'CREATE', (req, res) => {
  const { name, email } = req.body; // Already parsed!
  // No need for body-parser middleware
});
```

#### **3. Query String Parsing**
```javascript
server.get('/api/users', 'FETCH', (req, res) => {
  const { page, limit } = req.query; // Already parsed!
  // /api/users?page=1&limit=10
});
```

#### **4. Built-in Validation**
```javascript
const validator = server.validate({
  name: { required: true, type: 'string' },
  email: { required: true, pattern: /\S+@\S+\.\S+/ },
  age: { required: false, type: 'number', min: 18 }
});

server.post('/api/users', 'CREATE', (req, res) => {
  if (!validator(req, res)) return; // Auto-responds with 400
  
  // If we get here, data is valid!
});
```

#### **5. Sessions**
```javascript
server.useSession({ cookieName: 'my_session' });

server.get('/api/profile', 'PROFILE', (req, res) => {
  // Session automatically available
  const userId = req.session.userId;
  
  // Set session data
  req.session.isLoggedIn = true;
});
```

#### **6. CORS**
```javascript
server.enableCORS({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  headers: 'Content-Type,Authorization'
});

// Now works from any origin!
```

#### **7. Rate Limiting**
```javascript
server.rateLimit('/api/users', 10, 60000);
// 10 requests per minute

// Auto-blocks excess requests with 429
```

#### **8. Auto-Sync Signals**
```javascript
server.signal('users', []);
server.autoSync('users');

// ANY change to 'users' broadcasts to all clients!
server.set('users', [...users, newUser]);
// ↑ All connected clients receive update automatically!
```

---

## 💎 **NEW FRONTEND FEATURES:**

### **ScrollFetch - Built-in HTTP Client:**

#### **Basic Requests**
```javascript
// GET
const response = await app.Script.fetch.get('/api/users');
console.log(response.data);

// POST
const response = await app.Script.fetch.post('/api/users', {
  name: 'John',
  email: 'john@example.com'
});

// PUT
await app.Script.fetch.put('/api/users/1', { name: 'Jane' });

// DELETE
await app.Script.fetch.delete('/api/users/1');
```

#### **Reactive GET - Auto-Updates Signal**
```javascript
// Fetches and stores in signal
app.Script.fetch.reactiveGet('/api/users', 'users', {
  transform: (data) => data.users
});

// Signal auto-updates!
app.Script.watch('users', (users) => {
  console.log('Users updated:', users);
});

// With polling
app.Script.fetch.reactiveGet('/api/stats', 'stats', {
  interval: 2000, // Poll every 2 seconds
  transform: (data) => data.stats
});
```

#### **Resource Helper - Full CRUD**
```javascript
const usersAPI = app.Script.fetch.resource('users', '/api/users');

// Fetch all
await usersAPI.fetch();
// Users signal auto-updated!

// Create
await usersAPI.create({ name: 'John', email: 'john@example.com' });
// Users signal auto-updated!

// Update
await usersAPI.update(1, { name: 'Jane' });
// Users signal auto-updated!

// Delete
await usersAPI.delete(1);
// Users signal auto-updated!
```

#### **Config**
```javascript
// Set base URL
app.Script.fetch.setBaseURL('http://localhost:3000');

// Set headers
app.Script.fetch.setHeaders({
  'Authorization': 'Bearer token123'
});

// Request interceptor
app.Script.fetch.onRequest((config) => {
  console.log('Making request:', config);
  return config;
});

// Response interceptor
app.Script.fetch.onResponse((response) => {
  console.log('Got response:', response);
  return response;
});
```

---

## 🔥 **THE MAGIC: AUTO-SYNC EXAMPLE**

### **Server:**
```javascript
import { ScrollScriptServerAdvanced } from 'scrollforge/script';

const server = new ScrollScriptServerAdvanced();

// Create signal
server.signal('liveCount', 0);

// Auto-sync to clients
server.autoSync('liveCount');

// Update signal
server.post('/api/increment', 'INCREMENT', (req, res) => {
  const count = server.get('liveCount');
  server.set('liveCount', count + 1);
  // ↑ THIS BROADCASTS TO ALL CLIENTS AUTOMATICALLY!
  
  server.json(res, { count: count + 1 });
});

server.listen(3000);
```

### **Client:**
```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

// Create matching signal
app.Script.signal('liveCount', 0);

// Build component
const LiveCounter = HTMLScrollMesh(
  // HTML
  ({ count }) => `
    <div class="live-counter">
      <h1 class="count-display">${count}</h1>
      <button class="increment-btn">Increment</button>
    </div>
  `,
  
  // Weave - Animate on change!
  (state, weave) => {
    weave.spring('.count-display', {
      transform: 'scale(1.2)',
      color: 'green'
    });
    
    setTimeout(() => {
      weave.apply('.count-display', {
        transform: 'scale(1)',
        color: '#333'
      });
    }, 300);
  },
  
  // Logic
  (events, state) => {
    events.on('click', '.increment-btn', async () => {
      // POST to server
      await app.Script.fetch.post('/api/increment');
      // Server updates signal → broadcasts to ALL clients
      // This client AND all other tabs/users receive update!
    });
  },
  
  // State synced with signal
  () => ({
    count: app.Script.get('liveCount')
  })
);

// Watch signal and re-render
app.Script.watch('liveCount', (count) => {
  LiveCounter.state.count = count;
  LiveCounter._render();
});

LiveCounter.mount('#app');
```

### **What happens:**

1. User clicks button
2. POST to `/api/increment`
3. Server increments `liveCount` signal
4. Server broadcasts to ALL clients
5. **ALL clients** (including other users!) receive update
6. ScrollScript updates local signal
7. ScrollWeave animates the change
8. ScrollMesh re-renders
9. **User sees smooth, real-time update!**

**MULTIPLAYER BY DEFAULT!** 🤯

---

## 💪 **VS EXPRESS:**

### **Express:**
```javascript
// Express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(session({ secret: 'secret' }));
app.use(rateLimit({ windowMs: 60000, max: 10 }));

app.get('/api/users/:id', (req, res) => {
  const id = req.params.id;
  // ... manual logic
  res.json({ user });
});

app.listen(3000);
```

### **ScrollScript Server:**
```javascript
import { ScrollScriptServerAdvanced } from 'scrollforge/script';

const server = new ScrollScriptServerAdvanced();

server.enableCORS();
server.useSession();
server.rateLimit('/api/users', 10, 60000);

server.get('/api/users/:id', 'FETCH_USER', (req, res) => {
  const id = req.params.id; // Auto-extracted
  const users = server.get('users'); // From signal!
  const user = users.find(u => u.id === id);
  server.json(res, { user });
});

server.listen(3000);
```

**Same features, less code, reactive by default!**

---

## 🔥 **WHAT MAKES IT INSANE:**

### **1. Signals on Server**
```javascript
// Server state is reactive!
server.signal('users', []);

// Watch changes
server.watch('users', (users) => {
  console.log('Users changed on server:', users);
});

// Derived signals on server
server.derived('activeUsers', () => {
  const users = server.get('users');
  return users.filter(u => u.active);
}, ['users']);
```

### **2. Validation Built-In**
```javascript
const validator = server.validate({
  email: { required: true, pattern: /\S+@\S+/ },
  age: { type: 'number', min: 18 }
});

// One-liner validation!
```

### **3. Auto Body/Query Parsing**
```javascript
// No middleware needed
server.post('/api/users', 'CREATE', (req, res) => {
  const body = req.body;   // Already parsed!
  const query = req.query; // Already parsed!
  const params = req.params; // Already extracted!
});
```

### **4. Reactive APIs**
```javascript
// Server changes push to clients automatically
server.autoSync('users');

server.set('users', newUsers);
// ↑ All clients receive update instantly!
```

### **5. ScrollFetch Integration**
```javascript
// Frontend
app.Script.fetch.resource('users', '/api/users');

// One line = Full CRUD with auto-sync!
```

---

## 🎯 **COMPLETE EXAMPLE:**

See `examples/fullstack-demo/` for:
- `server.js` - Full ScrollScript server
- `client.html` - Frontend UI
- `client.js` - Full integration

**Run:**
```bash
cd examples/fullstack-demo
node server.js

# In another terminal
cd examples/fullstack-demo
open client.html
```

**Try:**
1. Add user → Animates → Syncs to server → Updates all clients
2. Delete user → Fades out → Syncs to server → Updates all clients
3. Open in 2 tabs → Changes sync between tabs in real-time!

---

## 💎 **THE REVOLUTION:**

**Backend Request → Frontend Auto-Updates → Weave Animates → Mesh Renders**

**ONE FRAMEWORK. ONE FLOW. PURE MAGIC.** ✨

---

🔥 **ScrollForge - Full-Stack Reactive Done Right!** 🔥

