# 🔥 ScrollForge Servers - Complete Explanation

## **Understanding the Two Types of Servers**

---

## 📚 **TABLE OF CONTENTS**

1. [Overview - Two Different Servers](#overview)
2. [CLI Dev Server (Frontend)](#cli-dev-server)
3. [ScrollScript Server (Backend)](#scrollscript-server)
4. [When to Use Each](#when-to-use-each)
5. [Full-Stack Setup](#full-stack-setup)
6. [Complete Examples](#complete-examples)

---

## 🎯 Overview - Two Different Servers

### **ScrollForge has TWO types of servers:**

| Server Type | Purpose | Port | Used For |
|-------------|---------|------|----------|
| **CLI Dev Server** | Serve static files | 3000-8080 | Frontend development |
| **ScrollScript Server** | Backend API | 3000-5000 | Backend logic, APIs, WebSocket |

**They serve DIFFERENT purposes!**

---

## 🌐 CLI Dev Server (Frontend)

### **What It Is:**

A simple HTTP file server for serving your frontend files during development.

**Think of it like:**
- Python's `http.server`
- `npx http-server`
- `live-server`

**But built into ScrollForge CLI!**

---

### **How to Start:**

#### **Method 1: Using CLI command**
```bash
# In your ScrollForge project directory
sf dev

# Custom port
sf dev --port 8080

# Auto-open browser
sf dev --open
```

#### **Method 2: Direct Node.js**
```bash
node cli/index.js dev --port 8080
```

#### **Method 3: npm script**
```bash
# In package.json:
"scripts": {
  "dev": "sf dev"
}

# Then:
npm run dev
```

---

### **What It Does:**

**Serves files from current directory:**
```
http://localhost:8080/index.html      → Serves index.html
http://localhost:8080/app.js          → Serves app.js
http://localhost:8080/style.css       → Serves style.css
http://localhost:8080/test-app/       → Serves test-app folder
```

**Supports:**
- ✅ HTML files
- ✅ JavaScript files
- ✅ CSS files
- ✅ Images
- ✅ JSON files
- ✅ Any static files

---

### **Example Project Structure:**

```
my-app/
├── index.html
├── app.js
├── style.css
└── assets/
    └── logo.png
```

**Start server:**
```bash
sf dev
```

**Access at:**
```
http://localhost:3000/index.html
```

---

### **Complete CLI Dev Server Example:**

**index.html:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="app.js"></script>
</body>
</html>
```

**app.js:**
```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

HTMLScrollMesh(
  ({ message }) => `<h1>${message}</h1>`,
  () => ({ message: 'Hello from ScrollForge!' })
).mount('#app');
```

**Start:**
```bash
sf dev --port 8080
```

**Visit:**
```
http://localhost:8080/index.html
```

**That's it!** The CLI dev server serves your files! ✅

---

### **CLI Dev Server Features:**

**What it has:**
- ✅ Simple HTTP server
- ✅ Serves static files
- ✅ MIME type handling
- ✅ 404 responses
- ✅ File watching (with `rollup -c -w`)

**What it DOESN'T have:**
- ❌ API routes
- ❌ Database connections
- ❌ Backend logic
- ❌ WebSocket
- ❌ Sessions/auth

**For those, use ScrollScript Server! →**

---

## ⚡ ScrollScript Server (Backend)

### **What It Is:**

A full-featured backend server runtime (like Express) with reactive signals and real-time capabilities.

**Think of it like:**
- Express
- Fastify
- Koa

**But with:**
- ✅ Reactive signals
- ✅ Auto-sync to clients
- ✅ WebSocket channels
- ✅ Action pipelines
- ✅ Same API as frontend!

---

### **THREE Server Versions - Choose Your Power Level:**

| Version | Level | Use When |
|---------|-------|----------|
| **ScrollScriptServer** | Basic | Simple APIs, prototypes |
| **ScrollScriptServerAdvanced** ⭐ | Recommended | Most projects (90%) |
| **ScrollScriptServerUltimate** | Enterprise | Complex architecture |

---

### **Version 1: ScrollScriptServer (Basic)**

**Import:**
```javascript
import { ScrollScriptServer } from 'scrollforge/script';
```

**Features:**
- ✅ Basic routing (GET, POST, PUT, DELETE)
- ✅ Signals
- ✅ Actions
- ✅ `autoSync()` for real-time
- ✅ Middleware (simple)
- ✅ JSON/HTML helpers

**Missing:**
- ❌ Route params (`:id`)
- ❌ Auto body parsing
- ❌ Sessions
- ❌ CORS helpers
- ❌ Validation

**Example:**
```javascript
import { ScrollScriptServer } from 'scrollforge/script';

const server = new ScrollScriptServer();

server.signal('count', 0);

server.get('/api/count', (req, res) => {
  server.json(res, { count: server.get('count') });
});

server.post('/api/increment', (req, res) => {
  const count = server.get('count');
  server.set('count', count + 1);
  server.json(res, { count: count + 1 });
});

server.autoSync('count'); // Broadcasts to clients

server.listen(3000);
```

---

### **Version 2: ScrollScriptServerAdvanced (RECOMMENDED!)** ⭐

**Import:**
```javascript
import { ScrollScriptServerAdvanced } from 'scrollforge/script';
```

**Features:**
- ✅ Everything from Basic
- ✅ **Route params** (`/users/:id`)
- ✅ **Auto body parsing** (JSON, form data)
- ✅ **Query string parsing**
- ✅ **Sessions** with cookies
- ✅ **CORS** helpers
- ✅ **Rate limiting**
- ✅ **Built-in validation**
- ✅ `autoSync()`

**Missing:**
- ❌ Composable routers
- ❌ Middleware lanes
- ❌ Action pipelines
- ❌ WebSocket channels

**Example:**
```javascript
import { ScrollScriptServerAdvanced } from 'scrollforge/script';

const server = new ScrollScriptServerAdvanced();

// Enable features
server.enableCORS();
server.useSession({ cookieName: 'my_session' });
server.rateLimit('/api/users', 10, 60000); // 10 req/min

server.signal('users', []);

// Route with params!
server.get('/api/users/:id', (req, res) => {
  const userId = req.params.id; // Auto-extracted!
  const query = req.query;      // Auto-parsed!
  
  const users = server.get('users');
  const user = users.find(u => u.id === parseInt(userId));
  
  server.json(res, { user });
});

// POST with validation
const validator = server.validate({
  name: { required: true, type: 'string' },
  email: { required: true, pattern: /\S+@\S+/ }
});

server.post('/api/users', (req, res) => {
  if (!validator(req, res)) return; // Auto-validates!
  
  const body = req.body; // Already parsed!
  const users = server.get('users');
  
  server.set('users', [...users, body]);
  server.json(res, { user: body }, 201);
});

server.autoSync('users'); // Real-time sync!

server.listen(3000);
```

**Why it's best:**
- ✅ Has all common features
- ✅ Easy to use
- ✅ Not too complex
- ✅ Perfect for 90% of apps

---

### **Version 3: ScrollScriptServerUltimate (Enterprise)**

**Import:**
```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';
```

**Features:**
- ✅ Everything from Advanced
- ✅ **Composable routers** (nest routers)
- ✅ **Middleware lanes** (before/after/error)
- ✅ **Action pipelines** (guard → transform → commit → effect)
- ✅ **WebSocket channels** (broadcast, presence, replay)
- ✅ **Dev tools** (hot reload, tracing, testing)
- ✅ `autoSync()` (v0.4.1+)

**Example:**
```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate();

// Enable features
server.enableCORS();
server.dev({ hotReload: true });

server.signal('users', []);

// Middleware lanes
server.before('logging', (req, res) => {
  console.log(`→ ${req.method} ${req.url}`);
});

server.after('metrics', (req, res) => {
  console.log(`← ${res.statusCode}`);
});

server.errorBoundary((error, req, res) => {
  server.json(res, { error: 'Server error' }, 500);
  return true;
});

// Composable routers
const apiRouter = server.createRouter('/api');

apiRouter.get('/users', (req, res) => {
  server.json(res, { users: server.get('users') });
});

apiRouter.get('/users/:id', (req, res) => {
  const user = server.get('users').find(u => u.id === parseInt(req.params.id));
  server.json(res, { user });
});

// Action pipeline
apiRouter.post('/users', server.pipeline()
  .guard((payload) => {
    return payload.req.headers.authorization === 'Bearer token';
  })
  .transform((payload) => ({
    ...payload,
    body: { ...payload.req.body, id: Date.now() }
  }))
  .commit((payload, script) => {
    const users = script.get('users');
    script.set('users', [...users, payload.body]);
    return payload.body;
  })
  .effect((user) => {
    console.log('User created:', user);
  })
  .build()
);

server.use(apiRouter);

// WebSocket channel
const chat = server.channel('chat', { replayLimit: 50 });

chat.on('MESSAGE', (data, client) => {
  chat.broadcast('NEW_MESSAGE', {
    text: data.text,
    user: data.user,
    timestamp: Date.now()
  });
});

// Auto-sync
server.autoSync('users');

server.listen(3000);
```

**Why use it:**
- ✅ Maximum features
- ✅ Enterprise architecture
- ✅ Complex apps
- ✅ Large teams

---

## 🎯 Which Server Should You Use?

### **Decision Tree:**

```
Do you need composable routers, pipelines, or WebSocket?
├─ YES → ScrollScriptServerUltimate
└─ NO → Do you need route params, sessions, or validation?
    ├─ YES → ScrollScriptServerAdvanced ⭐ (Recommended!)
    └─ NO → ScrollScriptServer (Basic)
```

---

### **Quick Comparison:**

| Feature | Basic | Advanced ⭐ | Ultimate |
|---------|-------|------------|----------|
| Routing | Simple | ✅ Params | ✅ Composable |
| Body Parsing | Manual | ✅ Auto | ✅ Auto |
| Sessions | ❌ | ✅ | ✅ |
| CORS | Manual | ✅ | ✅ |
| Validation | Manual | ✅ | ✅ |
| Rate Limit | ❌ | ✅ | ✅ |
| autoSync() | ✅ | ✅ | ✅ (v0.4.1+) |
| Middleware | Basic | Basic | ✅ Lanes |
| Routers | ❌ | ❌ | ✅ Composable |
| Pipelines | ❌ | ❌ | ✅ |
| WebSocket | Basic | Basic | ✅ Channels |
| Dev Tools | ❌ | ❌ | ✅ |

---

### **How to Start:**

**Create:** `server.js`

---

### **Basic Example:**

```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate();

// Signal (server state)
server.signal('count', 0);

// Routes
server.get('/', (req, res) => {
  server.html(res, '<h1>ScrollScript Server!</h1>');
});

server.get('/api/count', (req, res) => {
  const count = server.get('count');
  server.json(res, { count });
});

server.post('/api/increment', (req, res) => {
  const count = server.get('count');
  server.set('count', count + 1);
  server.json(res, { count: count + 1 });
});

// Start
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

**Run:**
```bash
node server.js
```

**Test:**
```bash
curl http://localhost:3000/api/count
# {"count":0}

curl -X POST http://localhost:3000/api/increment
# {"count":1}
```

---

### **Advanced Example - All Features:**

```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate({ debugMode: true });

// ===== Enable Features =====
server.enableCORS({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE'
});

server.dev({
  hotReload: true,
  watchPaths: ['./']
});

// ===== Signals =====
server.signal('users', [
  { id: 1, name: 'John', email: 'john@example.com' }
]);

server.signal('messages', []);

// ===== Middleware Lanes =====
server.before('logging', (req, res) => {
  console.log(`→ ${req.method} ${req.url}`);
});

server.before('auth', (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    server.json(res, { error: 'Unauthorized' }, 401);
    return false; // Stop pipeline
  }
  return true;
});

server.after('metrics', (req, res) => {
  console.log(`← ${res.statusCode}`);
});

server.errorBoundary((error, req, res) => {
  console.error('Error:', error);
  server.json(res, { error: 'Server error' }, 500);
  return true;
});

// ===== Composable Routers =====
const apiRouter = server.createRouter('/api');

// Users routes
apiRouter.get('/users', (req, res) => {
  const users = server.get('users');
  server.json(res, { users });
});

apiRouter.get('/users/:id', (req, res) => {
  const users = server.get('users');
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (user) {
    server.json(res, { user });
  } else {
    server.json(res, { error: 'User not found' }, 404);
  }
});

// Action Pipeline Route
apiRouter.post('/users', server.pipeline()
  .guard((payload) => {
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
    const users = script.get('users');
    script.set('users', [...users, payload.body]);
    return payload.body;
  })
  .effect((user) => {
    console.log('User created:', user);
  })
  .build()
);

apiRouter.delete('/users/:id', (req, res) => {
  const users = server.get('users');
  const id = parseInt(req.params.id);
  server.set('users', users.filter(u => u.id !== id));
  server.json(res, { success: true });
});

// Use router
server.use(apiRouter);

// ===== WebSocket Channel =====
const chatChannel = server.channel('chat', {
  replayLimit: 50
});

chatChannel.on('MESSAGE', (data, client) => {
  const messages = server.get('messages');
  const newMessage = {
    id: Date.now(),
    text: data.text,
    user: data.user,
    timestamp: new Date().toISOString()
  };
  
  server.set('messages', [...messages, newMessage]);
  chatChannel.broadcast('NEW_MESSAGE', newMessage);
});

// ===== Auto-Sync =====
server.autoSync('users');
server.autoSync('messages');

// ===== Start Server =====
server.listen(3000, () => {
  console.log('\n=== ScrollScript Server Ready! ===');
  console.log('HTTP: http://localhost:3000');
  console.log('WebSocket: ws://localhost:3000/ws');
  console.log('\nFeatures:');
  console.log('  ✅ Composable routers');
  console.log('  ✅ Middleware lanes');
  console.log('  ✅ Action pipelines');
  console.log('  ✅ WebSocket channels');
  console.log('  ✅ Auto signal sync');
  console.log('  ✅ CORS enabled');
  console.log('  ✅ Hot reload');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await server.shutdown();
  process.exit(0);
});
```

**Save as `server.js`, run:**
```bash
node server.js
```

---

## 🔗 When to Use Each

### **Use CLI Dev Server (`sf dev`) when:**

✅ Building frontend-only apps  
✅ Serving static files  
✅ Testing HTML/CSS/JS  
✅ No backend needed  
✅ Just want to see your UI  

**Example:**
```bash
sf dev --port 8080
# Open http://localhost:8080/index.html
```

---

### **Use ScrollScript Server when:**

✅ Building backend APIs  
✅ Need database connections  
✅ Need WebSocket/real-time  
✅ Need authentication  
✅ Need server-side logic  
✅ Building full-stack apps  

**Example:**
```bash
node server.js
# Runs backend on port 3000
```

---

## 🚀 Full-Stack Setup

### **Complete Full-Stack Application:**

**Project Structure:**
```
my-fullstack-app/
├── server.js          ← ScrollScript Server (Backend)
├── client/
│   ├── index.html     ← Frontend HTML
│   └── app.js         ← Frontend ScrollForge code
└── package.json
```

---

### **Step 1: Backend (`server.js`)**

```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate();

// Enable CORS (so frontend can call backend)
server.enableCORS({
  origin: 'http://localhost:8080' // Frontend URL
});

// Signals
server.signal('todos', []);

// Routes
server.get('/api/todos', (req, res) => {
  const todos = server.get('todos');
  server.json(res, { todos });
});

server.post('/api/todos', (req, res) => {
  const todos = server.get('todos');
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    completed: false
  };
  
  server.set('todos', [...todos, newTodo]);
  server.json(res, { todo: newTodo });
});

// Auto-sync todos to all clients
server.autoSync('todos');

// Start on port 3000
server.listen(3000, () => {
  console.log('Backend: http://localhost:3000');
});
```

---

### **Step 2: Frontend (`client/index.html`)**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Full-Stack Todo</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="app.js"></script>
</body>
</html>
```

---

### **Step 3: Frontend (`client/app.js`)**

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';
import ScrollForge from 'scrollforge';

window.app = new ScrollForge();

// Point to backend
app.Script.fetch.setBaseURL('http://localhost:3000');

// Create signal
app.Script.signal('todos', []);

// Fetch todos on load
app.Script.net.liveQuery('/api/todos', 'todos', {
  transform: (data) => data.todos,
  interval: 5000 // Poll every 5s
});

// Component
const TodoApp = HTMLScrollMesh(
  ({ todos }) => `
    <div>
      <h1>Full-Stack Todos</h1>
      <input class="new-todo" placeholder="New todo..." />
      <button class="add-btn">Add</button>
      
      <ul>
        ${todos.map(t => `
          <li>${t.text}</li>
        `).join('')}
      </ul>
    </div>
  `,
  
  (events, state) => {
    events.on('click', '.add-btn', async () => {
      const input = document.querySelector('.new-todo');
      const text = input.value.trim();
      
      if (!text) return;
      
      // POST to backend
      const response = await app.Script.fetch.post('/api/todos', {
        text
      });
      
      if (response.ok) {
        input.value = '';
        
        // Update local state
        const todos = app.Script.get('todos');
        app.Script.set('todos', [...todos, response.data.todo]);
      }
    });
  },
  
  () => ({
    todos: app.Script.get('todos')
  })
);

// Re-render when todos change
app.Script.watch('todos', () => {
  TodoApp.state.todos = app.Script.get('todos');
  TodoApp._render();
});

TodoApp.mount('#app');
```

---

### **Step 4: Run Both Servers**

**Terminal 1 (Backend):**
```bash
node server.js
# → Backend running on http://localhost:3000
```

**Terminal 2 (Frontend):**
```bash
cd client
sf dev --port 8080
# → Frontend running on http://localhost:8080
```

**Open browser:**
```
http://localhost:8080/index.html
```

**Now:**
- Frontend served by CLI dev server (8080) ✅
- Backend running on ScrollScript server (3000) ✅
- Frontend calls backend via fetch ✅
- Real-time sync via WebSocket ✅

---

## 🎯 When to Use Each

### **Scenario 1: Frontend-Only App**

**Use:** CLI Dev Server only ✅

```bash
sf dev
```

**Example:** Todo app with localStorage (like our test-app!)

---

### **Scenario 2: Backend API**

**Use:** ScrollScript Server only ✅

```bash
node server.js
```

**Example:** REST API for mobile app

---

### **Scenario 3: Full-Stack App**

**Use:** BOTH! ✅

```bash
# Terminal 1
node server.js

# Terminal 2
sf dev --port 8080
```

**Example:** Todo app with database, real-time sync

---

### **Scenario 4: Production**

**Frontend:**
```bash
sf build
# Outputs to dist/
# Serve with nginx/vercel/netlify
```

**Backend:**
```bash
node server.js
# Run on your VPS/cloud
```

---

## 🔥 Complete Examples

### **Example 1: Frontend-Only (CLI Dev Server)**

**File:** `app.html`
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script type="module">
    import { HTMLScrollMesh } from 'scrollforge/mesh';
    
    HTMLScrollMesh(
      ({ count }) => `
        <button>${count}</button>
      `,
      (events, state) => {
        events.on('click', 'button', () => state.count++);
      },
      () => ({ count: 0 })
    ).mount('#app');
  </script>
</body>
</html>
```

**Run:**
```bash
sf dev
# Open http://localhost:3000/app.html
```

---

### **Example 2: Backend-Only (ScrollScript Server)**

**File:** `api.js`
```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate();

server.signal('visitors', 0);

server.get('/api/visitors', (req, res) => {
  const count = server.get('visitors');
  server.set('visitors', count + 1);
  server.json(res, { visitors: count + 1 });
});

server.listen(3000);
```

**Run:**
```bash
node api.js
# API at http://localhost:3000/api/visitors
```

---

### **Example 3: Full-Stack Real-Time Chat**

**Backend (`chat-server.js`):**
```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate();

server.enableCORS();
server.signal('messages', []);

// REST API
server.get('/api/messages', (req, res) => {
  server.json(res, { messages: server.get('messages') });
});

// WebSocket Channel
const chat = server.channel('chat', { replayLimit: 50 });

chat.on('MESSAGE', (data) => {
  const messages = server.get('messages');
  const msg = {
    id: Date.now(),
    text: data.text,
    user: data.user,
    timestamp: new Date()
  };
  
  server.set('messages', [...messages, msg]);
  chat.broadcast('NEW_MESSAGE', msg);
});

server.autoSync('messages');
server.listen(3000);
```

**Frontend (`client/chat.html`):**
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script type="module">
    import ScrollForge from 'scrollforge';
    import { HTMLScrollMesh } from 'scrollforge/mesh';
    
    window.app = new ScrollForge();
    
    app.Script.fetch.setBaseURL('http://localhost:3000');
    app.Script.signal('messages', []);
    
    // Fetch messages
    app.Script.net.liveQuery('/api/messages', 'messages', {
      interval: 2000,
      transform: (data) => data.messages
    });
    
    // Component
    const Chat = HTMLScrollMesh(
      ({ messages }) => \`
        <div>
          <h1>Chat</h1>
          <div class="messages">
            \${messages.map(m => \`
              <p><strong>\${m.user}:</strong> \${m.text}</p>
            \`).join('')}
          </div>
          <input class="msg-input" />
          <button class="send-btn">Send</button>
        </div>
      \`,
      
      (events) => {
        events.on('click', '.send-btn', async () => {
          const input = document.querySelector('.msg-input');
          const text = input.value;
          
          if (text.trim()) {
            await app.Script.fetch.post('/api/chat', {
              text,
              user: 'Anonymous'
            });
            
            input.value = '';
          }
        });
      },
      
      () => ({ messages: app.Script.get('messages') })
    );
    
    app.Script.watch('messages', () => {
      Chat.state.messages = app.Script.get('messages');
      Chat._render();
    });
    
    Chat.mount('#app');
  </script>
</body>
</html>
```

**Run:**
```bash
# Terminal 1
node chat-server.js

# Terminal 2
cd client
sf dev --port 8080

# Open http://localhost:8080/chat.html
```

---

## 📊 Feature Comparison

| Feature | CLI Dev Server | ScrollScript Server |
|---------|----------------|---------------------|
| **Purpose** | Serve files | API/Backend |
| **Port** | 3000-8080 | Any |
| **Routing** | ❌ | ✅ Advanced |
| **Middleware** | ❌ | ✅ Lanes |
| **WebSocket** | ❌ | ✅ Channels |
| **Database** | ❌ | ✅ Compatible |
| **Sessions** | ❌ | ✅ Built-in |
| **CORS** | ❌ | ✅ Built-in |
| **Hot Reload** | ❌ | ✅ Built-in |
| **File Serving** | ✅ | ❌ |
| **Used For** | Frontend dev | Backend APIs |

---

## 🎯 Quick Reference

### **CLI Dev Server:**
```bash
# Start
sf dev

# Custom port
sf dev --port 8080

# Auto-open
sf dev --open

# Stop
Ctrl+C
```

**Serves:** Static files  
**URL:** http://localhost:PORT/your-file.html  

---

### **ScrollScript Server:**
```javascript
// Create
import { ScrollScriptServerUltimate } from 'scrollforge/script';
const server = new ScrollScriptServerUltimate();

// Routes
server.get('/path', handler);
server.post('/path', handler);

// Start
server.listen(3000);
```

**Provides:** API endpoints  
**URL:** http://localhost:3000/api/...  

---

## 💡 Common Patterns

### **Pattern 1: Frontend Development**
```bash
sf dev
# Just use CLI dev server
```

### **Pattern 2: API Development**
```bash
node server.js
# Just use ScrollScript server
```

### **Pattern 3: Full-Stack Development**
```bash
# Run both:
node server.js        # Port 3000
sf dev --port 8080    # Port 8080

# Frontend calls backend via fetch
```

### **Pattern 4: Production**
```bash
# Build frontend
sf build

# Deploy backend
node server.js

# Serve frontend static files with nginx/etc
```

---

## 🔥 Summary

**CLI Dev Server (`sf dev`):**
- Simple file server
- For frontend development
- Serves HTML/JS/CSS
- No backend logic

**ScrollScript Server (`ScrollScriptServerUltimate`):**
- Full backend server
- For APIs and backend logic
- Reactive signals
- WebSocket channels
- Beyond Express!

**Together:**
- Complete full-stack solution
- Frontend + Backend
- Real-time sync
- Production-ready

---

🔥 **ScrollForge - Two Servers, Infinite Possibilities!** 🔥

**Both explained in absolute detail!** 💎📚✨

