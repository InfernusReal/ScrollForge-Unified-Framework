# 🔥 Using ScrollForge - The Complete Integration Guide

**How to Use All Three Engines Together**

> *"Three engines. One paradigm. Infinite possibilities."*

---

## 📚 **TABLE OF CONTENTS**

1. [Installation & Imports](#installation--imports)
2. [The Three Ways to Use ScrollForge](#the-three-ways-to-use-scrollforge)
3. [Method 1: Individual Engines (Recommended)](#method-1-individual-engines-recommended)
4. [Method 2: Unified ScrollForge Class](#method-2-unified-scrollforge-class)
5. [Method 3: Context Auto-Wiring (Best for Components)](#method-3-context-auto-wiring-best-for-components)
6. [Connecting Signals to Components](#connecting-signals-to-components)
7. [Full-Stack Integration](#full-stack-integration)
8. [Complete Working Examples](#complete-working-examples)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## 📦 Installation & Imports

### **Installation**

```bash
npm install scrollforge
```

### **Import Options**

#### **Option 1: Individual Engines (Browser - Direct Files)**

```javascript
import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
import { ScrollWeaveCore } from './node_modules/scrollforge/dist/weave-core.browser.js';
import { HTMLScrollMesh } from './node_modules/scrollforge/dist/mesh-full.browser.js';

window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};
```

**Use when:** Running directly in browser without bundler

---

#### **Option 2: Unified Class (npm package)**

```javascript
import ScrollForge from 'scrollforge';

const app = new ScrollForge({ debugMode: true });

// Access engines:
app.Script.signal('count', 0);
app.Weave.apply('.button', { background: 'blue' });
app.Mesh.component('Counter', { /* ... */ });
```

**Use when:** Using npm package with bundler (Webpack, Vite, etc.)

---

#### **Option 3: Individual Engine Imports (npm)**

```javascript
import { ScrollScriptClient } from 'scrollforge/script';
import { ScrollWeaveCore } from 'scrollforge/weave';
import { ScrollMeshCore, HTMLScrollMesh } from 'scrollforge/mesh';

const script = new ScrollScriptClient();
const weave = new ScrollWeaveCore();

// Use them
script.signal('count', 0);
weave.apply('.button', { background: 'blue' });
```

**Use when:** Only need specific engines

---

## 🎯 The Three Ways to Use ScrollForge

### **Way 1: Separate Engines** ⭐ (Most Flexible)

```javascript
// Create instances
window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};

// Use separately
app.Script.signal('count', 0);
app.Weave.apply('.button', { background: 'blue' });

const Counter = HTMLScrollMesh(
  ({ count }) => `<button>${count}</button>`,
  (events, state) => {
    events.on('click', 'button', () => state.count++);
  },
  () => ({ count: app.Script.get('count') })
);
```

**Pros:**
- ✅ Maximum control
- ✅ Can use engines independently
- ✅ Works in browser without bundler
- ✅ Explicit and clear

**Cons:**
- ❌ More verbose
- ❌ Need to create `window.app` manually

---

### **Way 2: Unified Class** (Simplest)

```javascript
import ScrollForge from 'scrollforge';

const app = new ScrollForge({ debugMode: true });

// All engines available
app.Script.signal('count', 0);
app.Weave.apply('.button', { background: 'blue' });

const Counter = app.Mesh.component('Counter', {
  state: { count: 0 },
  render({ count }) {
    return {
      tag: 'button',
      content: `Count: ${count}`,
      events: {
        click: () => this.state.count++
      }
    };
  }
});

Counter.mount('#app');
```

**Pros:**
- ✅ Simple and clean
- ✅ All engines auto-integrated
- ✅ Less code

**Cons:**
- ❌ Requires npm package (doesn't work with direct file imports)
- ❌ Less flexible

---

### **Way 3: Context Auto-Wiring** ⭐⭐⭐ (BEST for Components)

```javascript
import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
import { ScrollWeaveCore } from './node_modules/scrollforge/dist/weave-core.browser.js';
import { HTMLScrollMesh } from './node_modules/scrollforge/dist/mesh-full.browser.js';

window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};

// Create global signals
app.Script.signal('count', 0);

// Component with auto-wiring - UNLIMITED FUNCTIONS!
const Counter = HTMLScrollMesh(
  // UI function
  ({ count }) => `<button>${count}</button>`,
  
  // Weave function
  (state, weave) => {
    weave.when('button',
      state.count > 10,
      { background: 'green', fontSize: '2rem' },
      { background: 'blue', fontSize: '1rem' }
    );
  },
  
  // Logic function
  (events, state) => {
    events.on('click', 'button', () => {
      state.count++;
      app.Script.set('count', state.count);
    });
  },
  
  // Effects function
  (state, effects) => {
    effects.when('count', (count) => {
      console.log('Count changed:', count);
    });
  },
  
  // State function
  () => ({
    count: app.Script.get('count')
  })
);

// Watch signals and sync to component
app.Script.watch('count', (count) => {
  Counter.state.count = count;
  Counter._render();
});

Counter.mount('#app');
```

**Pros:**
- ✅ ✨ **UNLIMITED auto-wired functions**
- ✅ Clean separation of concerns
- ✅ Works in browser without bundler
- ✅ Most powerful and flexible

**Cons:**
- ❌ Need to manually watch signals for sync
- ❌ More setup code

---

## 🔗 Connecting Signals to Components

### **The Critical Pattern**

**Problem:** Component state doesn't auto-update when signals change

**Solution:** Watch signals and update component state

```javascript
// Create global signal
app.Script.signal('connectionStatus', 'connecting');

// Component reads it initially
const ChatApp = HTMLScrollMesh(
  ({ connectionStatus }) => `<div>Status: ${connectionStatus}</div>`,
  
  () => ({
    connectionStatus: app.Script.get('connectionStatus')  // Reads ONCE
  })
);

// ✅ THE FIX: Watch and sync!
app.Script.watch('connectionStatus', (status) => {
  ChatApp.state.connectionStatus = status;
  ChatApp._render();
});

// Now when signal changes:
app.Script.set('connectionStatus', 'connected');
// → Watcher fires
// → Component state updates
// → UI re-renders
// → ✨ Everything works!
```

### **Multiple Signal Syncing**

```javascript
// Create signals
app.Script.signal('user', null);
app.Script.signal('notifications', []);
app.Script.signal('theme', 'dark');

// Component
const App = HTMLScrollMesh(
  ({ user, notifications, theme }) => `...`,
  
  () => ({
    user: app.Script.get('user'),
    notifications: app.Script.get('notifications'),
    theme: app.Script.get('theme')
  })
);

// Sync all signals
app.Script.watch('user', (user) => {
  App.state.user = user;
  App._render();
});

app.Script.watch('notifications', (notifications) => {
  App.state.notifications = notifications;
  App._render();
});

app.Script.watch('theme', (theme) => {
  App.state.theme = theme;
  App._render();
});

App.mount('#app');
```

### **Helper Function for Auto-Sync**

```javascript
// Create a helper to auto-sync multiple signals
function syncSignalsToComponent(component, signalNames) {
  signalNames.forEach(signalName => {
    app.Script.watch(signalName, (value) => {
      component.state[signalName] = value;
      component._render();
    });
  });
}

// Use it
const ChatApp = HTMLScrollMesh(/* ... */);

syncSignalsToComponent(ChatApp, [
  'messages',
  'connectionStatus',
  'username',
  'isLoggedIn'
]);

ChatApp.mount('#app');
```

---

## 🌐 Full-Stack Integration

### **Complete Full-Stack Setup**

**Backend (`server.js`):**
```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate({ debugMode: true });

// Enable features
server.enableCORS({ origin: '*' });

// Signals
server.signal('users', []);
server.signal('messages', []);

// Auto-sync to clients
server.autoSync('users');
server.autoSync('messages');

// WebSocket channel
const chat = server.channel('chat');

chat.on('NEW_MESSAGE', (data, client) => {
  const messages = server.get('messages') || [];
  const newMsg = {
    id: Date.now(),
    username: data.username,
    text: data.text,
    timestamp: new Date().toISOString()
  };
  
  server.set('messages', [...messages, newMsg]);
  
  // Auto-broadcasts to all clients!
  chat.broadcast('MESSAGE_SENT', { message: newMsg });
});

// HTTP Routes
server.get('/api/messages', (req, res) => {
  const messages = server.get('messages') || [];
  server.json(res, { messages });
});

server.listen(9000, () => {
  console.log('🔥 Server ready on port 9000');
});
```

**Frontend (`app.js`):**
```javascript
import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
import { ScrollWeaveCore } from './node_modules/scrollforge/dist/weave-core.browser.js';
import { HTMLScrollMesh } from './node_modules/scrollforge/dist/mesh-full.browser.js';

window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};

// Create matching signals
app.Script.signal('messages', []);
app.Script.signal('connectionStatus', 'connecting');

// WebSocket connection
const ws = new WebSocket('ws://localhost:9000/ws');

ws.onopen = () => {
  app.Script.set('connectionStatus', 'connected');
};

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'MESSAGE_SENT') {
    const messages = app.Script.get('messages');
    app.Script.set('messages', [...messages, msg.data.message]);
  }
};

// Component
const ChatApp = HTMLScrollMesh(
  ({ messages, connectionStatus }) => `
    <div>
      <div class="status">${connectionStatus}</div>
      <div class="messages">
        ${messages.map(m => `
          <div>${m.username}: ${m.text}</div>
        `).join('')}
      </div>
      <input class="msg-input" />
      <button class="send-btn">Send</button>
    </div>
  `,
  
  (events, state) => {
    events.on('click', '.send-btn', () => {
      const input = document.querySelector('.msg-input');
      const text = input.value.trim();
      
      if (text) {
        // Send to server
        ws.send(JSON.stringify({
          type: 'NEW_MESSAGE',
          data: { username: 'User', text }
        }));
        
        input.value = '';
      }
    });
  },
  
  () => ({
    messages: app.Script.get('messages'),
    connectionStatus: app.Script.get('connectionStatus')
  })
);

// Sync signals to component
app.Script.watch('messages', (messages) => {
  ChatApp.state.messages = messages;
  ChatApp._render();
});

app.Script.watch('connectionStatus', (status) => {
  ChatApp.state.connectionStatus = status;
  ChatApp._render();
});

ChatApp.mount('#app');
```

---

## 📖 Complete Working Examples

### **Example 1: Simple Counter (All Three Engines)**

```javascript
import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
import { ScrollWeaveCore } from './node_modules/scrollforge/dist/weave-core.browser.js';
import { HTMLScrollMesh } from './node_modules/scrollforge/dist/mesh-full.browser.js';

// Setup
window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};

// Global signal
app.Script.signal('count', 0);

// Component
const Counter = HTMLScrollMesh(
  // UI - ScrollMesh
  ({ count }) => `
    <div class="counter">
      <h1 class="count-display">${count}</h1>
      <button class="increment">+</button>
      <button class="decrement">-</button>
    </div>
  `,
  
  // Styling - ScrollWeave
  (state, weave) => {
    weave.when('.count-display',
      state.count > 10,
      { color: 'green', fontSize: '4rem' },
      { color: 'blue', fontSize: '2rem' }
    );
    
    weave.apply('.counter', {
      textAlign: 'center',
      padding: '40px'
    });
  },
  
  // Logic
  (events, state) => {
    events.on('click', '.increment', () => {
      state.count++;
      app.Script.set('count', state.count);
    });
    
    events.on('click', '.decrement', () => {
      state.count--;
      app.Script.set('count', state.count);
    });
  },
  
  // State
  () => ({
    count: app.Script.get('count')
  })
);

// Sync signal to component - ScrollScript
app.Script.watch('count', (count) => {
  Counter.state.count = count;
  Counter._render();
});

Counter.mount('#app');

// All three engines working together! ✨
```

---

### **Example 2: Todo App (With Persistence)**

```javascript
import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
import { ScrollWeaveCore } from './node_modules/scrollforge/dist/weave-core.browser.js';
import { HTMLScrollMesh } from './node_modules/scrollforge/dist/mesh-full.browser.js';

window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};

// Global signals
app.Script.signal('todos', []);

const TodoApp = HTMLScrollMesh(
  // UI
  ({ todos }) => `
    <div class="todo-app">
      <h1>📝 Todos</h1>
      <input class="new-todo" placeholder="What to do?" />
      <ul>
        ${todos.map(t => `
          <li class="${t.done ? 'done' : ''}">
            <input type="checkbox" ${t.done ? 'checked' : ''} data-id="${t.id}">
            <span>${t.text}</span>
            <button class="delete" data-id="${t.id}">×</button>
          </li>
        `).join('')}
      </ul>
    </div>
  `,
  
  // Styling
  (state, weave) => {
    weave.apply('.done span', {
      textDecoration: 'line-through',
      color: '#999'
    });
  },
  
  // Logic
  (events, state) => {
    events.on('keydown', '.new-todo', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        const newTodo = {
          id: Date.now(),
          text: e.target.value.trim(),
          done: false
        };
        
        state.todos = [...state.todos, newTodo];
        app.Script.set('todos', state.todos);
        
        e.target.value = '';
      }
    });
    
    events.on('change', 'input[type="checkbox"]', (e) => {
      const id = parseInt(e.target.dataset.id);
      state.todos = state.todos.map(t => 
        t.id === id ? { ...t, done: !t.done } : t
      );
      app.Script.set('todos', state.todos);
    });
    
    events.on('click', '.delete', (e) => {
      const id = parseInt(e.target.dataset.id);
      state.todos = state.todos.filter(t => t.id !== id);
      app.Script.set('todos', state.todos);
    });
  },
  
  // State - Load from localStorage
  () => ({
    todos: JSON.parse(localStorage.getItem('todos') || '[]')
  }),
  
  // Effects - Save to localStorage
  (state, effects) => {
    effects.when('todos', (todos) => {
      localStorage.setItem('todos', JSON.stringify(todos));
    });
  }
);

// Sync signal to component
app.Script.watch('todos', (todos) => {
  TodoApp.state.todos = todos;
  TodoApp._render();
});

TodoApp.mount('#app');
```

---

### **Example 3: Full-Stack Chat App**

**Backend (`server.js`):**
```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate({ debugMode: true });

server.enableCORS({ origin: '*' });

// Signals
server.signal('messages', []);
server.signal('users', []);

// Auto-sync
server.autoSync('messages');
server.autoSync('users');

// WebSocket
const chat = server.channel('chat');

chat.on('USER_JOIN', (data, client) => {
  const users = server.get('users') || [];
  server.set('users', [...users, {
    id: client.id,
    username: data.username
  }]);
  
  chat.broadcast('USER_JOINED', { username: data.username });
});

chat.on('SEND_MESSAGE', (data, client) => {
  const messages = server.get('messages') || [];
  const newMsg = {
    id: Date.now(),
    username: data.username,
    text: data.text,
    timestamp: new Date().toISOString()
  };
  
  server.set('messages', [...messages, newMsg]);
  chat.broadcast('NEW_MESSAGE', { message: newMsg });
});

server.listen(9000);
```

**Frontend (`app.js`):**
```javascript
import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
import { ScrollWeaveCore } from './node_modules/scrollforge/dist/weave-core.browser.js';
import { HTMLScrollMesh } from './node_modules/scrollforge/dist/mesh-full.browser.js';

window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};

// Signals
app.Script.signal('messages', []);
app.Script.signal('connectionStatus', 'connecting');
app.Script.signal('username', '');
app.Script.signal('isLoggedIn', false);

// WebSocket
let ws = new WebSocket('ws://localhost:9000/ws');

ws.onopen = () => {
  app.Script.set('connectionStatus', 'connected');
};

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'NEW_MESSAGE') {
    const messages = app.Script.get('messages');
    app.Script.set('messages', [...messages, msg.data.message]);
  }
};

// Component
const ChatApp = HTMLScrollMesh(
  ({ isLoggedIn, username, messages, connectionStatus }) => {
    if (!isLoggedIn) {
      return `
        <div>
          <h1>Join Chat</h1>
          <input class="username-input" placeholder="Username" />
          <button class="login-btn">Join</button>
        </div>
      `;
    }
    
    return `
      <div>
        <h1>Chat (${connectionStatus})</h1>
        <div class="messages">
          ${messages.map(m => `
            <div>${m.username}: ${m.text}</div>
          `).join('')}
        </div>
        <input class="msg-input" />
        <button class="send-btn">Send</button>
      </div>
    `;
  },
  
  (events, state) => {
    // Login
    events.on('click', '.login-btn', () => {
      const input = document.querySelector('.username-input');
      const username = input.value.trim();
      
      if (username) {
        state.username = username;
        state.isLoggedIn = true;
        
        app.Script.set('username', username);
        app.Script.set('isLoggedIn', true);
        
        ws.send(JSON.stringify({
          type: 'USER_JOIN',
          data: { username }
        }));
      }
    });
    
    // Send message
    events.on('click', '.send-btn', () => {
      const input = document.querySelector('.msg-input');
      const text = input.value.trim();
      
      if (text) {
        ws.send(JSON.stringify({
          type: 'SEND_MESSAGE',
          data: { username: state.username, text }
        }));
        
        input.value = '';
      }
    });
  },
  
  () => ({
    isLoggedIn: app.Script.get('isLoggedIn'),
    username: app.Script.get('username'),
    messages: app.Script.get('messages'),
    connectionStatus: app.Script.get('connectionStatus')
  })
);

// Sync signals to component
app.Script.watch('messages', (messages) => {
  ChatApp.state.messages = messages;
  ChatApp._render();
});

app.Script.watch('connectionStatus', (status) => {
  ChatApp.state.connectionStatus = status;
  ChatApp._render();
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
```

---

## 🎯 Common Patterns

### **Pattern 1: Global State + Components**

```javascript
// Step 1: Create global signals
app.Script.signal('user', null);
app.Script.signal('cart', []);
app.Script.signal('theme', 'dark');

// Step 2: Create component
const App = HTMLScrollMesh(
  ({ user, cart, theme }) => `...`,
  
  () => ({
    user: app.Script.get('user'),
    cart: app.Script.get('cart'),
    theme: app.Script.get('theme')
  })
);

// Step 3: Sync signals to component
['user', 'cart', 'theme'].forEach(signalName => {
  app.Script.watch(signalName, (value) => {
    App.state[signalName] = value;
    App._render();
  });
});

// Step 4: Mount
App.mount('#app');

// Step 5: Update signals anywhere
app.Script.set('theme', 'light');  // Component auto-updates!
```

---

### **Pattern 2: Actions + Components**

```javascript
// Define actions
app.Script.action('LOGIN', (payload) => {
  app.Script.set('user', payload.user);
  app.Script.set('isLoggedIn', true);
});

app.Script.action('LOGOUT', () => {
  app.Script.set('user', null);
  app.Script.set('isLoggedIn', false);
});

// Component
const LoginButton = HTMLScrollMesh(
  ({ isLoggedIn, user }) => `
    ${isLoggedIn 
      ? `<button class="logout">Logout ${user.name}</button>`
      : `<button class="login">Login</button>`
    }
  `,
  
  (events) => {
    events.on('click', '.login', () => {
      // Trigger action
      app.Script.trigger('LOGIN', {
        user: { name: 'John', email: 'john@example.com' }
      });
    });
    
    events.on('click', '.logout', () => {
      app.Script.trigger('LOGOUT');
    });
  },
  
  () => ({
    isLoggedIn: app.Script.get('isLoggedIn'),
    user: app.Script.get('user')
  })
);

// Sync
app.Script.watch('isLoggedIn', (isLoggedIn) => {
  LoginButton.state.isLoggedIn = isLoggedIn;
  LoginButton._render();
});

app.Script.watch('user', (user) => {
  LoginButton.state.user = user;
  LoginButton._render();
});

LoginButton.mount('#app');
```

---

### **Pattern 3: Derived Signals + Components**

```javascript
// Base signals
app.Script.signal('firstName', 'John');
app.Script.signal('lastName', 'Doe');
app.Script.signal('birthYear', 1990);

// Derived signals
app.Script.derived('fullName', () => {
  const first = app.Script.get('firstName');
  const last = app.Script.get('lastName');
  return `${first} ${last}`;
}, ['firstName', 'lastName']);

app.Script.derived('age', () => {
  const birthYear = app.Script.get('birthYear');
  return new Date().getFullYear() - birthYear;
}, ['birthYear']);

// Component
const Profile = HTMLScrollMesh(
  ({ fullName, age }) => `
    <div>
      <h2>${fullName}</h2>
      <p>Age: ${age}</p>
    </div>
  `,
  
  () => ({
    fullName: app.Script.get('fullName'),
    age: app.Script.get('age')
  })
);

// Sync derived signals
app.Script.watch('fullName', (fullName) => {
  Profile.state.fullName = fullName;
  Profile._render();
});

app.Script.watch('age', (age) => {
  Profile.state.age = age;
  Profile._render();
});

Profile.mount('#app');

// Change base signal
app.Script.set('firstName', 'Jane');
// → fullName auto-updates to "Jane Doe"
// → Component re-renders! ✨
```

---

## ⚠️ Troubleshooting

### **Issue: Component doesn't update when signal changes**

**Problem:**
```javascript
app.Script.set('count', 5);
// Component still shows old value!
```

**Solution:**
```javascript
// Add signal watcher
app.Script.watch('count', (count) => {
  MyComponent.state.count = count;
  MyComponent._render();
});
```

---

### **Issue: "Cannot find module" when importing**

**Problem:**
```javascript
import ScrollForge from 'scrollforge';  // Error!
```

**Solutions:**

**If in browser without bundler:**
```javascript
// Use direct file imports
import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
```

**If using bundler (Webpack, Vite):**
```javascript
// npm package import works
import ScrollForge from 'scrollforge';
```

---

### **Issue: Input refreshes on every keystroke**

**Problem:**
```javascript
({ inputValue }) => `<input value="${inputValue}">`,
events.on('input', 'input', (e) => {
  state.inputValue = e.target.value;  // Re-render every keystroke!
});
```

**Solution:**
```javascript
// Uncontrolled input
() => `<input class="my-input">`,  // No value binding!

events.on('keydown', '.my-input', (e) => {
  if (e.key === 'Enter') {
    state.data = e.target.value;  // Only update on submit
  }
});
```

---

### **Issue: Data vanishes on page refresh**

**Problem:**
```javascript
() => ({
  todos: app.Script.get('todos')  // Empty on refresh!
})
```

**Solution:**
```javascript
// Load synchronously in state function
() => ({
  todos: JSON.parse(localStorage.getItem('todos') || '[]')
}),

// Save in effects
(state, effects) => {
  effects.when('todos', (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos));
  });
}
```

---

## 🎓 The Golden Rules

### **1. Import Strategy**

**In Browser (no bundler):**
```javascript
import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
import { ScrollWeaveCore } from './node_modules/scrollforge/dist/weave-core.browser.js';
import { HTMLScrollMesh } from './node_modules/scrollforge/dist/mesh-full.browser.js';
```

**With Bundler:**
```javascript
import ScrollForge from 'scrollforge';
// or
import { ScrollScriptClient } from 'scrollforge/script';
```

---

### **2. Signal-Component Connection**

```javascript
// ✅ ALWAYS sync signals to component state
app.Script.watch('signalName', (value) => {
  Component.state.signalName = value;
  Component._render();
});
```

---

### **3. Persistence Pattern**

```javascript
// ✅ LOAD in state function (sync)
() => ({
  data: JSON.parse(localStorage.getItem('key') || 'default')
})

// ✅ SAVE in effects
effects.when('data', (data) => {
  localStorage.setItem('key', JSON.stringify(data));
});
```

---

### **4. Input Handling**

```javascript
// ✅ UNCONTROLLED inputs (no value binding)
() => `<input class="my-input">`,

// ✅ Read from DOM when needed
events.on('keydown', '.my-input', (e) => {
  if (e.key === 'Enter') {
    state.data = e.target.value;
  }
});
```

---

### **5. Three Engines Together**

```javascript
// ScrollScript - Global state
app.Script.signal('count', 0);

// ScrollMesh - Component
const Counter = HTMLScrollMesh(
  ({ count }) => `<button>${count}</button>`,
  
  // ScrollWeave - Styling
  (state, weave) => {
    weave.when('button',
      state.count > 10,
      { color: 'green' },
      { color: 'blue' }
    );
  },
  
  (events, state) => {
    events.on('click', 'button', () => {
      state.count++;
      app.Script.set('count', state.count);
    });
  },
  
  () => ({ count: app.Script.get('count') })
);

// Connect them
app.Script.watch('count', (count) => {
  Counter.state.count = count;
  Counter._render();
});

Counter.mount('#app');

// All three engines working in harmony! 🔥
```

---

## 🚀 Quick Start Checklist

**For a new ScrollForge project:**

```bash
# 1. Install
npm install scrollforge

# 2. Create index.html
# - Add <div id="app"></div>
# - Add <script type="module" src="app.js"></script>

# 3. Create app.js with this template:
```

```javascript
// Import
import { ScrollScriptClient } from './node_modules/scrollforge/dist/client.browser.js';
import { ScrollWeaveCore } from './node_modules/scrollforge/dist/weave-core.browser.js';
import { HTMLScrollMesh } from './node_modules/scrollforge/dist/mesh-full.browser.js';

// Setup
window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};

// Create signals
app.Script.signal('yourData', initialValue);

// Create component
const YourApp = HTMLScrollMesh(
  ({ yourData }) => `<div>${yourData}</div>`,
  
  (events, state) => {
    // Event handlers
  },
  
  () => ({
    yourData: app.Script.get('yourData')
  })
);

// Sync signals
app.Script.watch('yourData', (value) => {
  YourApp.state.yourData = value;
  YourApp._render();
});

// Mount
YourApp.mount('#app');
```

```bash
# 4. Run dev server
npx scrollforge dev --port 8080

# 5. Open browser
http://localhost:8080/index.html
```

---

## 📊 Summary

### **Three Engines, One Paradigm:**

**ScrollScript** (⚡)
- Global signals
- Actions and triggers
- Time-travel debugging
- Works client + server

**ScrollWeave** (🎨)
- Runtime-controlled CSS
- Conditional styling
- Built-in animations
- State-driven appearance

**ScrollMesh** (🏗️)
- Component assembly
- Context auto-wiring
- HTML templates
- Unlimited functions

### **How They Connect:**

```
Global Signals (ScrollScript)
        ↓
    Watchers
        ↓
Component State (ScrollMesh)
        ↓
    UI Re-render
        ↓
Reactive Styles (ScrollWeave)
        ↓
✨ CAUSAL GRAPH PROGRAMMING ✨
```

---

🔥 **ScrollForge - Three Engines, One Vision** 🔥

**Built on Causal Graph Programming**
**Powered by Shared Variables Theory**
**The Future of Reactive Applications** ✨

---

**Master this guide = Master full-stack reactive development!** 🚀

