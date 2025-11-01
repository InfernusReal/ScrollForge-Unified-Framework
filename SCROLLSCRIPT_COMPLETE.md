# ⚡ ScrollScript Complete Guide

**The Universal Data Flow Engine - Client + Server**

> *"Connect functions through shared global state. Single dispatcher routes all actions. This is the apex manager pattern."*

---

## 📚 **TABLE OF CONTENTS**

1. [Philosophy - Shared Variables Theory](#philosophy---shared-variables-theory)
2. [Core Concepts](#core-concepts)
3. [Signals - Reactive Values](#signals---reactive-values)
4. [Derived Signals - Computed Values](#derived-signals---computed-values)
5. [Actions - State Mutations](#actions---state-mutations)
6. [Watchers - Observing Changes](#watchers---observing-changes)
7. [Data Persistence - THE CORRECT WAY](#data-persistence---the-correct-way)
8. [Cross-Tab Sync](#cross-tab-sync)
9. [Event Bindings (Client Only)](#event-bindings-client-only)
10. [Time-Travel Debugging](#time-travel-debugging)
11. [Server-Side ScrollScript](#server-side-scrollscript)
12. [Network Features](#network-features)
13. [Advanced Patterns](#advanced-patterns)
14. [Performance Optimization](#performance-optimization)
15. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
16. [Complete API Reference](#complete-api-reference)

---

## 🎯 Philosophy - Shared Variables Theory

### **The Core Paradigm**

ScrollScript is built on **Shared Variables Theory**, the foundation of Causal Graph Programming:

**Traditional Approach (Props Drilling):**
```javascript
// React/Vue pattern - pass everything down
<Parent>
  <Child data={data} onClick={handler}>
    <GrandChild data={data} onClick={handler}>
      <GreatGrandChild data={data} onClick={handler} />
    </GrandChild>
  </Child>
</Parent>

// Or callback hell
function Parent() {
  const [data, setData] = useState();
  const handler = (newData) => setData(newData);
  
  return <Child onUpdate={handler} />;
}

function Child({ onUpdate }) {
  return <GrandChild onUpdate={onUpdate} />;
}

function GrandChild({ onUpdate }) {
  // Finally can use it!
  onUpdate(newData);
}
```

**Shared Variables Theory (ScrollScript):**
```javascript
// Create shared global state
app.Script.signal('data', initialValue);

// ANY function can access it - ZERO props drilling!
function componentA() {
  const data = app.Script.get('data');
  // Use data
}

function componentB() {
  app.Script.set('data', newValue);
  // Updates everywhere automatically!
}

function componentC() {
  app.Script.watch('data', (newValue) => {
    // React to changes
  });
}

// All connected through shared variables - no manual wiring!
```

### **Why This Is Revolutionary:**

**1. No Props Drilling**
- All state is global and accessible
- No passing props through 10 levels
- Functions connect to what they need

**2. Single Dispatcher**
- One apex manager controls all actions
- Predictable state flow
- Easy to debug and trace

**3. Explicit Causality**
- Event → Action → State → Effect
- The causal graph is visible
- Time-travel debugging becomes natural

**4. Universal API**
- Same code works on client and server
- Full-stack reactive programming
- One mental model everywhere

---

## 🔥 Core Concepts

### **The Data Flow:**

```
User Event
    ↓
Action Triggered
    ↓
State Changed (Signal)
    ↓
Watchers Notified
    ↓
UI Updates / Side Effects
```

### **The Signal System:**

**Signals are reactive values** that:
- ✅ Store state
- ✅ Notify watchers when changed
- ✅ Support time-travel
- ✅ Can be derived/computed
- ✅ Work across client/server

### **The Action System:**

**Actions are state mutations** that:
- ✅ Have unique type identifiers
- ✅ Can have guards (permissions)
- ✅ Can transform payloads
- ✅ Trigger side effects
- ✅ Are recorded in history

---

## 📡 Signals - Reactive Values

### **Creating Signals**

**Syntax:**
```javascript
app.Script.signal(name, initialValue, scope);
```

**Parameters:**
- `name` (string) - Unique identifier for the signal
- `initialValue` (any) - Starting value (can be any type)
- `scope` (string, optional) - 'global' (default), 'app', 'page', 'component'

**Examples:**

```javascript
// Primitive values
app.Script.signal('count', 0);
app.Script.signal('username', 'Guest');
app.Script.signal('isLoggedIn', false);
app.Script.signal('temperature', 72.5);

// Objects
app.Script.signal('user', {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
});

// Arrays
app.Script.signal('todos', []);
app.Script.signal('users', [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);

// Complex nested structures
app.Script.signal('appState', {
  ui: {
    modal: { isOpen: false, content: null },
    sidebar: { collapsed: true }
  },
  data: {
    cache: new Map(),
    pending: []
  }
});

// With scope
app.Script.signal('pageData', {}, 'page');      // Page-level
app.Script.signal('componentState', {}, 'component');  // Component-level
```

**Scope Explained:**

- `'global'` - Shared across entire app (default)
- `'app'` - App instance level
- `'page'` - Current page/route
- `'component'` - Component instance

---

### **Getting Signal Values**

**Syntax:**
```javascript
const value = app.Script.get(name);
```

**Returns:** Current value of the signal

**Examples:**

```javascript
// Get primitive
const count = app.Script.get('count');
console.log(count); // 0

// Get object
const user = app.Script.get('user');
console.log(user.name); // 'John'
console.log(user.preferences.theme); // 'dark'

// Get array
const todos = app.Script.get('todos');
console.log(todos.length); // 0

// Get with default fallback
const items = app.Script.get('items') || [];
const config = app.Script.get('config') || { theme: 'light' };

// Deep access
const user = app.Script.get('user');
const theme = user?.preferences?.theme || 'light';
```

**Important Notes:**

- ✅ Always returns current value
- ✅ Returns `undefined` if signal doesn't exist
- ✅ Safe to call repeatedly (no side effects)
- ⚠️ Returns reference to objects/arrays (be careful with mutations!)

---

### **Setting Signal Values**

**Syntax:**
```javascript
app.Script.set(name, value);
```

**Effects:**
1. Updates the signal value
2. Triggers all watchers immediately
3. Re-renders connected components
4. Records in history (if time-travel enabled)
5. Broadcasts to server (if auto-synced)
6. Syncs across tabs (if cross-tab sync enabled)

**Examples:**

```javascript
// Set primitive
app.Script.set('count', 5);

// Update object (immutable pattern)
const user = app.Script.get('user');
app.Script.set('user', { 
  ...user, 
  name: 'Jane',
  email: 'jane@example.com'
});

// Deep update
const user = app.Script.get('user');
app.Script.set('user', {
  ...user,
  preferences: {
    ...user.preferences,
    theme: 'light'
  }
});

// Update array (immutable)
const todos = app.Script.get('todos');

// Add item
app.Script.set('todos', [...todos, { id: 3, text: 'New todo' }]);

// Remove item
app.Script.set('todos', todos.filter(t => t.id !== 2));

// Update item
app.Script.set('todos', todos.map(t => 
  t.id === 1 ? { ...t, completed: true } : t
));

// Replace entire array
app.Script.set('users', [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
]);
```

**Best Practices:**

```javascript
// ✅ GOOD - Immutable updates
const user = app.Script.get('user');
app.Script.set('user', { ...user, age: 26 });

// ❌ BAD - Direct mutation (won't trigger watchers!)
const user = app.Script.get('user');
user.age = 26;  // Doesn't trigger updates!

// ✅ GOOD - Array immutable
const todos = app.Script.get('todos');
app.Script.set('todos', [...todos, newItem]);

// ❌ BAD - Direct mutation
const todos = app.Script.get('todos');
todos.push(newItem);  // Doesn't trigger updates!

// ✅ GOOD - Conditional update
const count = app.Script.get('count');
if (count < 10) {
  app.Script.set('count', count + 1);
}

// ✅ GOOD - Batch multiple changes
const user = app.Script.get('user');
const settings = app.Script.get('settings');

app.Script.set('user', { ...user, verified: true });
app.Script.set('settings', { ...settings, emailNotifications: true });
// Both trigger updates, but batched internally!
```

---

## 🧮 Derived Signals - Computed Values

Derived signals are **computed from other signals** and auto-update when dependencies change.

### **Creating Derived Signals**

**Syntax:**
```javascript
app.Script.derived(name, computeFn, dependencies, scope);
```

**Parameters:**
- `name` (string) - Name for the derived signal
- `computeFn` (function) - Returns computed value
- `dependencies` (array) - Signal names to watch
- `scope` (string, optional) - Same as regular signals

**Examples:**

```javascript
// Simple derived signal
app.Script.signal('firstName', 'John');
app.Script.signal('lastName', 'Doe');

app.Script.derived('fullName', () => {
  const first = app.Script.get('firstName');
  const last = app.Script.get('lastName');
  return `${first} ${last}`;
}, ['firstName', 'lastName']);

// Use it
const fullName = app.Script.get('fullName'); // 'John Doe'

// Auto-updates!
app.Script.set('firstName', 'Jane');
app.Script.get('fullName'); // 'Jane Doe' ✨

// Derived from multiple signals
app.Script.signal('cartItems', []);
app.Script.signal('taxRate', 0.08);
app.Script.signal('discount', 0);

app.Script.derived('subtotal', () => {
  const items = app.Script.get('cartItems');
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, ['cartItems']);

app.Script.derived('tax', () => {
  const subtotal = app.Script.get('subtotal');
  const taxRate = app.Script.get('taxRate');
  return subtotal * taxRate;
}, ['subtotal', 'taxRate']);

app.Script.derived('total', () => {
  const subtotal = app.Script.get('subtotal');
  const tax = app.Script.get('tax');
  const discount = app.Script.get('discount');
  return subtotal + tax - discount;
}, ['subtotal', 'tax', 'discount']);

// Complex derived signal
app.Script.signal('users', [
  { id: 1, name: 'Alice', active: true, role: 'admin' },
  { id: 2, name: 'Bob', active: false, role: 'user' },
  { id: 3, name: 'Charlie', active: true, role: 'user' }
]);

app.Script.derived('activeUsers', () => {
  const users = app.Script.get('users');
  return users.filter(u => u.active);
}, ['users']);

app.Script.derived('adminCount', () => {
  const users = app.Script.get('users');
  return users.filter(u => u.role === 'admin').length;
}, ['users']);

app.Script.derived('userStats', () => {
  const users = app.Script.get('users');
  return {
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    admins: users.filter(u => u.role === 'admin').length,
    activeAdmins: users.filter(u => u.active && u.role === 'admin').length
  };
}, ['users']);
```

**Performance:**

- ✅ **Memoized** - Result is cached until dependencies change
- ✅ **Lazy** - Only computed when accessed
- ✅ **Efficient** - Doesn't recalculate on every get()
- ✅ **Cascading** - Derived signals can depend on other derived signals

---

## 🎬 Actions - State Mutations

Actions are the **ONLY way to mutate state** in proper Causal Graph Programming.

### **Creating Actions**

**Syntax:**
```javascript
app.Script.action(type, handler, options);
```

**Parameters:**
- `type` (string) - Unique action identifier (UPPERCASE by convention)
- `handler` (function) - Action handler `(payload) => {}`
- `options` (object, optional) - `{ guard, transform, sideEffects }`

**Basic Examples:**

```javascript
// Simple action - no payload
app.Script.action('INCREMENT', () => {
  const count = app.Script.get('count');
  app.Script.set('count', count + 1);
});

// Action with payload
app.Script.action('SET_USERNAME', (payload) => {
  app.Script.set('username', payload.username);
});

// Action with multiple state changes
app.Script.action('LOGIN', (payload) => {
  app.Script.set('user', payload.user);
  app.Script.set('isLoggedIn', true);
  app.Script.set('loginTimestamp', Date.now());
});

// Action that reads multiple signals
app.Script.action('ADD_TO_CART', (payload) => {
  const cart = app.Script.get('cart');
  const inventory = app.Script.get('inventory');
  
  // Check if item exists in inventory
  const item = inventory.find(i => i.id === payload.itemId);
  
  if (item && item.stock > 0) {
    // Add to cart
    app.Script.set('cart', [...cart, {
      ...item,
      quantity: payload.quantity || 1
    }]);
    
    // Update inventory
    app.Script.set('inventory', inventory.map(i => 
      i.id === payload.itemId 
        ? { ...i, stock: i.stock - 1 }
        : i
    ));
  }
});
```

### **Action Options**

#### **Guard - Permission Checks**

```javascript
// Guard - prevent action if condition not met
app.Script.action('DELETE_USER', (payload) => {
  const users = app.Script.get('users');
  app.Script.set('users', users.filter(u => u.id !== payload.userId));
}, {
  guard: (payload) => {
    // Don't allow deleting admin user
    const currentUser = app.Script.get('currentUser');
    return currentUser.role === 'admin' && payload.userId !== 1;
  }
});

// Multiple guards
app.Script.action('TRANSFER_MONEY', (payload) => {
  // ... transfer logic
}, {
  guard: (payload) => {
    const user = app.Script.get('currentUser');
    const account = app.Script.get('account');
    
    // Check authentication
    if (!user.isAuthenticated) return false;
    
    // Check balance
    if (account.balance < payload.amount) return false;
    
    // Check limit
    if (payload.amount > 10000) return false;
    
    return true;
  }
});
```

#### **Transform - Modify Payload**

```javascript
// Transform payload before processing
app.Script.action('CREATE_TODO', (payload) => {
  const todos = app.Script.get('todos');
  app.Script.set('todos', [...todos, payload.todo]);
}, {
  transform: (payload) => ({
    todo: {
      ...payload,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      completed: false,
      priority: payload.priority || 'normal'
    }
  })
});

// Data sanitization
app.Script.action('UPDATE_PROFILE', (payload) => {
  app.Script.set('profile', payload.profile);
}, {
  transform: (payload) => ({
    profile: {
      ...payload.profile,
      email: payload.profile.email.toLowerCase().trim(),
      name: payload.profile.name.trim(),
      bio: payload.profile.bio?.substring(0, 500) || ''
    }
  })
});
```

#### **Side Effects**

```javascript
// Side effects that don't affect state
app.Script.action('PLACE_ORDER', (payload) => {
  const orders = app.Script.get('orders');
  const newOrder = { ...payload, id: Date.now() };
  app.Script.set('orders', [...orders, newOrder]);
}, {
  sideEffects: [
    // Send confirmation email
    (payload) => {
      console.log('📧 Sending confirmation email...');
      sendEmail(payload.email, 'Order confirmed!');
    },
    
    // Log analytics
    (payload) => {
      console.log('📊 Logging order analytics...');
      logAnalytics('order_placed', { 
        amount: payload.total,
        items: payload.items.length
      });
    },
    
    // Update inventory
    (payload) => {
      console.log('📦 Updating inventory...');
      payload.items.forEach(item => {
        updateInventory(item.id, -item.quantity);
      });
    }
  ]
});

// Async side effects
app.Script.action('SAVE_DRAFT', (payload) => {
  app.Script.set('draft', payload.content);
}, {
  sideEffects: [
    async (payload) => {
      // Save to server
      await fetch('/api/drafts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      console.log('✅ Draft saved to server');
    }
  ]
});
```

### **Triggering Actions**

**Syntax:**
```javascript
app.Script.trigger(type, payload, scope);
```

**Examples:**

```javascript
// Simple trigger
app.Script.trigger('INCREMENT');

// With payload
app.Script.trigger('SET_USERNAME', { 
  username: 'Alice' 
});

// Complex payload
app.Script.trigger('ADD_TO_CART', {
  itemId: 42,
  quantity: 2,
  options: {
    color: 'blue',
    size: 'medium'
  }
});

// With scope
app.Script.trigger('PAGE_LOADED', { 
  route: '/dashboard' 
}, 'page');

// Conditional trigger
if (isValid) {
  app.Script.trigger('SUBMIT_FORM', formData);
}

// Chained actions
app.Script.trigger('LOGIN', { user });
app.Script.trigger('FETCH_USER_DATA', { userId: user.id });
app.Script.trigger('TRACK_LOGIN', { timestamp: Date.now() });
```

---

## 👀 Watchers - Observing Changes

Watchers let you **react to signal changes**.

### **Basic Watching**

**Syntax:**
```javascript
const unsubscribe = app.Script.watch(signalName, callback);
```

**Parameters:**
- `signalName` (string) - Signal to watch
- `callback` (function) - Called with `(newValue, oldValue)`

**Returns:** Unsubscribe function

**Examples:**

```javascript
// Watch single signal
app.Script.watch('count', (newValue, oldValue) => {
  console.log(`Count changed: ${oldValue} → ${newValue}`);
});

// Watch and update UI
app.Script.watch('username', (username) => {
  document.title = `Chat - ${username}`;
});

// Watch array changes
app.Script.watch('todos', (todos) => {
  console.log(`Todo count: ${todos.length}`);
  
  const completed = todos.filter(t => t.completed).length;
  console.log(`Completed: ${completed}/${todos.length}`);
});

// Watch object changes
app.Script.watch('user', (user, oldUser) => {
  console.log('User updated:', user);
  
  if (user.email !== oldUser?.email) {
    console.log('📧 Email changed - verify new address');
  }
  
  if (user.preferences.theme !== oldUser?.preferences?.theme) {
    console.log('🎨 Theme changed - update UI');
    applyTheme(user.preferences.theme);
  }
});

// Multiple watchers on same signal
app.Script.watch('score', (score) => {
  console.log('Score:', score);
});

app.Script.watch('score', (score) => {
  if (score > 100) {
    alert('High score! 🎉');
  }
});

app.Script.watch('score', (score) => {
  document.querySelector('.score').textContent = score;
});

// All fire when score changes!
```

### **Unsubscribing**

```javascript
// Store the unsubscribe function
const unwatch = app.Script.watch('count', (count) => {
  console.log('Count:', count);
});

// Later, stop watching
unwatch();

// Or store multiple
const unwatchers = [];

unwatchers.push(app.Script.watch('signal1', handler1));
unwatchers.push(app.Script.watch('signal2', handler2));
unwatchers.push(app.Script.watch('signal3', handler3));

// Cleanup all at once
unwatchers.forEach(unwatch => unwatch());

// Or in component unmount
class MyComponent {
  constructor() {
    this.watchers = [];
    
    this.watchers.push(
      app.Script.watch('data', this.handleData)
    );
  }
  
  unmount() {
    // Clean up all watchers
    this.watchers.forEach(unwatch => unwatch());
  }
}
```

### **Watching Multiple Signals**

```javascript
// Watch related signals
app.Script.watch('firstName', () => updateFullName());
app.Script.watch('lastName', () => updateFullName());

function updateFullName() {
  const first = app.Script.get('firstName');
  const last = app.Script.get('lastName');
  document.querySelector('.full-name').textContent = `${first} ${last}`;
}

// Or use derived signal (better!)
app.Script.derived('fullName', () => {
  const first = app.Script.get('firstName');
  const last = app.Script.get('lastName');
  return `${first} ${last}`;
}, ['firstName', 'lastName']);

app.Script.watch('fullName', (fullName) => {
  document.querySelector('.full-name').textContent = fullName;
});
```

---

## 💾 Data Persistence - THE CORRECT WAY

### **⚠️ THE PROBLEM WITH `app.Script.persist()`**

**Why persist() doesn't work for initial load:**

```javascript
// ❌ WRONG - Data vanishes on refresh!
app.Script.signal('todos', []);
app.Script.persist('todos');  // Saves automatically, but loads ASYNC!

const TodoApp = HTMLScrollMesh(
  ({ todos }) => `...`,
  
  () => ({
    todos: app.Script.get('todos')  // Gets [] on first load! 💀
  })
);

// Refresh page → todos are gone!
```

**What happens:**
1. `signal('todos', [])` creates signal with `[]`
2. `persist('todos')` starts async load from localStorage
3. State function runs IMMEDIATELY with `app.Script.get('todos')` = `[]`
4. Component renders with empty array
5. localStorage loads (too late!)
6. **Your data is gone on every refresh!** 💀

---

### **✅ THE CORRECT WAY - Load Synchronously**

**Pattern:**
```javascript
// Create signal (value doesn't matter much)
app.Script.signal('todos', []);

// DON'T use persist() for initial load!

const TodoApp = HTMLScrollMesh(
  ({ todos }) => `...`,
  
  // ✅ Load in state function (runs FIRST, synchronous!)
  () => ({
    todos: JSON.parse(localStorage.getItem('todos') || '[]'),
    filter: 'all'
  }),
  
  // ✅ Save in effects (runs when todos change)
  (state, effects) => {
    effects.when('todos', (todos) => {
      localStorage.setItem('todos', JSON.stringify(todos));
      console.log('💾 Todos saved!');
    });
  }
);

// Now refresh → todos persist! ✅
```

---

### **📋 Complete Persistence Patterns**

#### **Pattern 1: Simple Value Persistence**

```javascript
const Counter = HTMLScrollMesh(
  ({ count }) => `<button>${count}</button>`,
  
  (events, state) => {
    events.on('click', 'button', () => state.count++);
  },
  
  // Load from localStorage
  () => ({
    count: parseInt(localStorage.getItem('count') || '0')
  }),
  
  // Save to localStorage
  (state, effects) => {
    effects.when('count', (count) => {
      localStorage.setItem('count', count.toString());
    });
  }
);
```

#### **Pattern 2: Object Persistence**

```javascript
const SettingsApp = HTMLScrollMesh(
  ({ theme, fontSize, notifications }) => `...`,
  
  // Load settings
  () => {
    const defaultSettings = {
      theme: 'dark',
      fontSize: 16,
      notifications: true
    };
    
    const saved = localStorage.getItem('settings');
    const settings = saved ? JSON.parse(saved) : defaultSettings;
    
    return settings;
  },
  
  // Save settings
  (state, effects) => {
    effects.when('theme', saveSettings);
    effects.when('fontSize', saveSettings);
    effects.when('notifications', saveSettings);
    
    function saveSettings() {
      const settings = {
        theme: state.theme,
        fontSize: state.fontSize,
        notifications: state.notifications
      };
      localStorage.setItem('settings', JSON.stringify(settings));
    }
  }
);
```

#### **Pattern 3: Array Persistence (Like Todos)**

```javascript
const TodoApp = HTMLScrollMesh(
  ({ todos }) => `...`,
  
  (events, state) => {
    events.on('keydown', '.new-todo', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        state.todos = [...state.todos, {
          id: Date.now(),
          text: e.target.value.trim(),
          completed: false,
          createdAt: new Date().toISOString()
        }];
        e.target.value = '';
      }
    });
    
    events.on('change', 'input[type="checkbox"]', (e) => {
      const id = parseInt(e.target.dataset.id);
      state.todos = state.todos.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      );
    });
    
    events.on('click', '.delete', (e) => {
      const id = parseInt(e.target.dataset.id);
      state.todos = state.todos.filter(t => t.id !== id);
    });
  },
  
  // ✅ LOAD synchronously in state function
  () => ({
    todos: JSON.parse(localStorage.getItem('todos') || '[]'),
    filter: 'all'
  }),
  
  // ✅ SAVE in effects
  (state, effects) => {
    effects.when('todos', (todos) => {
      localStorage.setItem('todos', JSON.stringify(todos));
      console.log(`💾 Saved ${todos.length} todos`);
    });
  }
);
```

#### **Pattern 4: Multiple Values Persistence**

```javascript
const ChatApp = HTMLScrollMesh(
  ({ username, messages, preferences }) => `...`,
  
  // Load multiple values
  () => ({
    // Each loads synchronously
    username: localStorage.getItem('username') || '',
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    messages: JSON.parse(localStorage.getItem('messages') || '[]'),
    preferences: JSON.parse(localStorage.getItem('preferences') || '{"theme":"dark"}')
  }),
  
  // Save each value
  (state, effects) => {
    effects.when('username', (username) => {
      localStorage.setItem('username', username);
    });
    
    effects.when('isLoggedIn', (isLoggedIn) => {
      localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    });
    
    effects.when('messages', (messages) => {
      // Only save last 100 messages
      const recent = messages.slice(-100);
      localStorage.setItem('messages', JSON.stringify(recent));
    });
    
    effects.when('preferences', (preferences) => {
      localStorage.setItem('preferences', JSON.stringify(preferences));
    });
  }
);
```

#### **Pattern 5: Versioned Persistence (Migration Support)**

```javascript
const STORAGE_VERSION = 2;

const App = HTMLScrollMesh(
  ({ data }) => `...`,
  
  () => {
    const saved = localStorage.getItem('appData');
    
    if (!saved) {
      // No saved data - use defaults
      return {
        data: [],
        version: STORAGE_VERSION
      };
    }
    
    try {
      const parsed = JSON.parse(saved);
      
      // Check version
      if (parsed.version !== STORAGE_VERSION) {
        console.log('🔄 Migrating data from version', parsed.version);
        const migrated = migrateData(parsed, STORAGE_VERSION);
        return migrated;
      }
      
      return parsed;
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      return { data: [], version: STORAGE_VERSION };
    }
  },
  
  (state, effects) => {
    effects.when('data', (data) => {
      const toSave = {
        data,
        version: STORAGE_VERSION,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('appData', JSON.stringify(toSave));
    });
  }
);

function migrateData(oldData, targetVersion) {
  if (oldData.version === 1 && targetVersion === 2) {
    // v1 → v2 migration
    return {
      data: oldData.items.map(item => ({
        ...item,
        newField: 'default'  // Add new field
      })),
      version: 2
    };
  }
  
  return oldData;
}
```

---

### **🎯 Persistence Best Practices**

#### **✅ DO:**

```javascript
// ✅ Load in state function (synchronous!)
() => ({
  todos: JSON.parse(localStorage.getItem('todos') || '[]')
})

// ✅ Save in effects
effects.when('todos', (todos) => {
  localStorage.setItem('todos', JSON.stringify(todos));
});

// ✅ Handle errors
() => {
  try {
    const saved = localStorage.getItem('data');
    return { data: saved ? JSON.parse(saved) : [] };
  } catch (error) {
    console.error('Load failed:', error);
    return { data: [] };
  }
}

// ✅ Limit storage size
effects.when('messages', (messages) => {
  const recent = messages.slice(-100);  // Last 100 only
  localStorage.setItem('messages', JSON.stringify(recent));
});

// ✅ Debounce saves for performance
let saveTimeout;
effects.when('bigData', (data) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem('bigData', JSON.stringify(data));
  }, 500);  // Save 500ms after last change
});
```

#### **❌ DON'T:**

```javascript
// ❌ Don't use persist() for initial load
app.Script.persist('todos');  // Async load - too late!

() => ({
  todos: app.Script.get('todos')  // Gets empty value!
})

// ❌ Don't forget to handle null
() => ({
  todos: JSON.parse(localStorage.getItem('todos'))  // Crashes if null!
})

// ✅ Always provide fallback
() => ({
  todos: JSON.parse(localStorage.getItem('todos') || '[]')
})

// ❌ Don't mutate and expect persistence
const todos = app.Script.get('todos');
todos.push(newTodo);  // Doesn't trigger effects!

// ✅ Immutable update
state.todos = [...state.todos, newTodo];  // Triggers effects!

// ❌ Don't save on every keystroke
events.on('input', 'textarea', (e) => {
  state.text = e.target.value;
  localStorage.setItem('text', e.target.value);  // Too frequent!
});

// ✅ Debounce or save on blur
let saveTimer;
events.on('input', 'textarea', (e) => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem('text', e.target.value);
  }, 1000);
});
```

---

### **💡 Advanced Persistence Patterns**

#### **Pattern 6: Selective Persistence**

```javascript
() => ({
  // Persist these
  username: localStorage.getItem('username') || '',
  preferences: JSON.parse(localStorage.getItem('preferences') || '{}'),
  
  // Don't persist these (temporary)
  currentInput: '',
  isLoading: false,
  errorMessage: ''
}),

(state, effects) => {
  // Only save what should persist
  effects.when('username', (username) => {
    localStorage.setItem('username', username);
  });
  
  effects.when('preferences', (preferences) => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  });
  
  // currentInput, isLoading, errorMessage NOT saved
}
```

#### **Pattern 7: Namespace Persistence (Multiple Apps)**

```javascript
const APP_PREFIX = 'scrollforge_chat_';

() => ({
  messages: JSON.parse(
    localStorage.getItem(`${APP_PREFIX}messages`) || '[]'
  ),
  username: localStorage.getItem(`${APP_PREFIX}username`) || ''
}),

(state, effects) => {
  effects.when('messages', (messages) => {
    localStorage.setItem(
      `${APP_PREFIX}messages`, 
      JSON.stringify(messages)
    );
  });
}
```

#### **Pattern 8: Compression for Large Data**

```javascript
// For very large datasets, compress before saving
() => ({
  bigData: decompressData(
    localStorage.getItem('bigData') || ''
  )
}),

(state, effects) => {
  effects.when('bigData', (data) => {
    const compressed = compressData(data);
    localStorage.setItem('bigData', compressed);
  });
});

function compressData(obj) {
  // Simple compression - remove whitespace
  return JSON.stringify(obj);
}

function decompressData(str) {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}
```

#### **Pattern 9: Expire Old Data**

```javascript
() => {
  const saved = localStorage.getItem('sessionData');
  
  if (saved) {
    try {
      const { data, timestamp } = JSON.parse(saved);
      const age = Date.now() - timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (age < maxAge) {
        return { data };
      } else {
        console.log('🗑️ Expired data - clearing');
        localStorage.removeItem('sessionData');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }
  
  return { data: [] };
},

(state, effects) => {
  effects.when('data', (data) => {
    const toSave = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem('sessionData', JSON.stringify(toSave));
  });
}
```

---

### **🔥 THE DEFINITIVE PERSISTENCE RULE:**

```
📜 SCROLLFORGE PERSISTENCE LAW:

1. LOAD in state function (synchronous!)
   () => ({ data: JSON.parse(localStorage.getItem('key') || 'default') })

2. SAVE in effects (when state changes)
   effects.when('data', (data) => {
     localStorage.setItem('key', JSON.stringify(data));
   });

3. NEVER use app.Script.persist() for initial load
   It's async and loads too late!

4. ALWAYS provide fallback defaults
   localStorage.getItem('key') || '[]'
   localStorage.getItem('key') || '{}'
   localStorage.getItem('key') || '""'
```

---

## 🔄 Cross-Tab Sync

**Synchronize signals across browser tabs** automatically!

### **Basic Cross-Tab Sync**

```javascript
// Create signal
app.Script.signal('cart', []);

// Enable cross-tab sync
app.Script.sync('cart');

// Now:
// - Tab 1 changes cart → Tab 2 updates automatically!
// - Tab 2 changes cart → Tab 1 updates automatically!
// ✨ Magic!
```

### **How It Works**

```javascript
app.Script.sync('signalName');
```

**Under the hood:**
1. Watches the signal for changes
2. On change → saves to localStorage
3. Fires `storage` event to other tabs
4. Other tabs listen for `storage` event
5. Other tabs update their signal
6. **All tabs stay in sync!** ✨

### **Complete Example**

```javascript
// Create shopping cart signal
app.Script.signal('cart', []);

// Enable sync
app.Script.sync('cart');

// Component
const Cart = HTMLScrollMesh(
  ({ cart }) => `
    <div>
      <h2>Cart (${cart.length} items)</h2>
      ${cart.map(item => `
        <div>${item.name} - $${item.price}</div>
      `).join('')}
      <button class="add-item">Add Item</button>
    </div>
  `,
  
  (events, state) => {
    events.on('click', '.add-item', () => {
      state.cart = [...state.cart, {
        id: Date.now(),
        name: 'Product ' + (state.cart.length + 1),
        price: Math.random() * 100
      }];
      // Automatically syncs to other tabs! ✨
    });
  },
  
  () => ({
    cart: app.Script.get('cart')
  })
);

// Open in 2 tabs:
// - Add item in Tab 1
// - Tab 2 updates automatically!
// - Add item in Tab 2
// - Tab 1 updates automatically!
```

### **Multiple Signals**

```javascript
// Sync multiple signals
app.Script.sync('user');
app.Script.sync('cart');
app.Script.sync('preferences');
app.Script.sync('notifications');

// All stay in sync across all tabs!
```

### **Selective Sync**

```javascript
// Sync only certain values
app.Script.signal('appState', {
  user: { name: 'John' },
  ui: { modal: false },
  temp: { data: 'xyz' }
});

// Only sync user and ui, not temp
app.Script.watch('appState', (state) => {
  const syncData = {
    user: state.user,
    ui: state.ui
    // temp excluded - not synced
  };
  
  localStorage.setItem('syncedState', JSON.stringify(syncData));
  // Fire event for other tabs
  localStorage.setItem('syncTrigger', Date.now().toString());
});

// Listen in other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'syncTrigger') {
    const synced = JSON.parse(localStorage.getItem('syncedState'));
    const current = app.Script.get('appState');
    
    app.Script.set('appState', {
      ...current,
      user: synced.user,
      ui: synced.ui
      // temp keeps its tab-local value
    });
  }
});
```

---

## ⌨️ Event Bindings (Client Only)

ScrollScript can **bind DOM events directly to actions**.

### **Keyboard Events**

```javascript
// Single key
app.Script.onKey('Enter', 'SUBMIT_FORM');
app.Script.onKey('Escape', 'CLOSE_MODAL');
app.Script.onKey('s', 'SAVE_DOCUMENT');
app.Script.onKey('/', 'OPEN_SEARCH');

// With modifier keys
app.Script.onKey('Control+s', 'SAVE');  // Ctrl+S
app.Script.onKey('Alt+n', 'NEW_DOCUMENT');  // Alt+N

// Arrow keys
app.Script.onKey('ArrowUp', 'SCROLL_UP');
app.Script.onKey('ArrowDown', 'SCROLL_DOWN');
app.Script.onKey('ArrowLeft', 'PREVIOUS_ITEM');
app.Script.onKey('ArrowRight', 'NEXT_ITEM');

// With payload
app.Script.onKey('Enter', 'SUBMIT', { submitted: true });

// Action handler
app.Script.action('SUBMIT_FORM', () => {
  const form = document.querySelector('form');
  // Submit form
});
```

### **Click Events**

```javascript
// By selector
app.Script.onClick('#submit-btn', 'SUBMIT_FORM');
app.Script.onClick('.delete-btn', 'DELETE_ITEM');
app.Script.onClick('button.primary', 'PRIMARY_ACTION');

// With payload extractor
app.Script.onClick('.user-item', 'SELECT_USER', (e) => ({
  userId: e.target.dataset.userId,
  userName: e.target.dataset.userName
}));

// Multiple clicks
app.Script.onClick('.like-btn', 'LIKE_POST');
app.Script.onClick('.share-btn', 'SHARE_POST');
app.Script.onClick('.save-btn', 'SAVE_POST');
```

### **Form Events**

```javascript
// Form submit
app.Script.onSubmit('#contact-form', 'SUBMIT_CONTACT');

// Action handler
app.Script.action('SUBMIT_CONTACT', (payload) => {
  // payload contains FormData as object
  console.log(payload.name);
  console.log(payload.email);
  console.log(payload.message);
});

// Input change
app.Script.onInput('#search', 'SEARCH_CHANGED');

app.Script.action('SEARCH_CHANGED', (payload) => {
  // payload = { value, name }
  app.Script.set('searchQuery', payload.value);
});
```

### **Scroll Events**

```javascript
// Throttled scroll (default 100ms)
app.Script.onScroll('SCROLL_UPDATED', 100);

app.Script.action('SCROLL_UPDATED', (payload) => {
  // payload includes:
  console.log(payload.scrollY);       // Vertical position
  console.log(payload.scrollX);       // Horizontal position
  console.log(payload.scrollHeight);  // Total height
  console.log(payload.clientHeight);  // Visible height
  console.log(payload.scrollPercent); // 0-100
  
  // Show back-to-top button
  if (payload.scrollPercent > 50) {
    app.Script.set('showBackToTop', true);
  }
});

// Custom throttle (200ms)
app.Script.onScroll('HEAVY_SCROLL_HANDLER', 200);
```

### **Pointer/Mouse Events**

```javascript
// Track mouse position (16ms throttle for 60fps)
app.Script.onPointer('MOUSE_MOVED', 16);

app.Script.action('MOUSE_MOVED', (payload) => {
  // payload: { x, y }
  app.Script.set('mouseX', payload.x);
  app.Script.set('mouseY', payload.y);
});

// Custom throttle
app.Script.onPointer('TRACK_CURSOR', 100);
```

### **Intersection Observer**

```javascript
// Lazy load images
app.Script.onIntersect('.lazy-image', 'IMAGE_VISIBLE', {
  threshold: 0.5  // 50% visible
});

app.Script.action('IMAGE_VISIBLE', (payload) => {
  // payload: { isIntersecting, ratio, element }
  if (payload.isIntersecting) {
    const img = payload.element;
    img.src = img.dataset.src;
    console.log('🖼️ Loading image');
  }
});

// Infinite scroll
app.Script.onIntersect('.load-more-trigger', 'LOAD_MORE', {
  threshold: 1.0
});

app.Script.action('LOAD_MORE', (payload) => {
  if (payload.isIntersecting) {
    const items = app.Script.get('items');
    // Load more items
    fetchMoreItems().then(newItems => {
      app.Script.set('items', [...items, ...newItems]);
    });
  }
});
```

### **Animation Frame**

```javascript
// Game loop
const stopAnimation = app.Script.onFrame('GAME_TICK');

app.Script.action('GAME_TICK', (payload) => {
  // payload includes timestamp
  const deltaTime = payload.timestamp - lastTime;
  updateGame(deltaTime);
});

// Stop when needed
stopAnimation();
```

---

## 🔧 Utilities

### **Debounce**

```javascript
// Create debounced action
const debouncedSearch = app.Script.debounce('SEARCH', 300);

// Use it
input.addEventListener('input', (e) => {
  debouncedSearch({ query: e.target.value });
});

// Only fires once after 300ms of inactivity
app.Script.action('SEARCH', (payload) => {
  console.log('Searching for:', payload.query);
  performSearch(payload.query);
});
```

**Use cases:**
- Search inputs
- Auto-save drafts
- Resize handlers
- API calls

### **Throttle**

```javascript
// Create throttled action
const throttledScroll = app.Script.throttle('SCROLL_HANDLER', 100);

// Use it
window.addEventListener('scroll', () => {
  throttledScroll({ y: window.scrollY });
});

// Fires maximum once every 100ms
app.Script.action('SCROLL_HANDLER', (payload) => {
  updateScrollPosition(payload.y);
});
```

**Use cases:**
- Scroll handlers
- Mouse move tracking
- Window resize
- Performance-critical updates

---

## ⏱️ Time-Travel Debugging

ScrollScript has **built-in time-travel** for debugging!

### **Basic Time-Travel**

```javascript
// Enable time-travel (enabled by default)
const app = new ScrollForge({ enableTimeTravel: true });

// Make changes
app.Script.set('count', 1);
app.Script.set('count', 2);
app.Script.set('count', 3);

// Undo
app.Script.undo();
app.Script.get('count'); // 2

app.Script.undo();
app.Script.get('count'); // 1

app.Script.undo();
app.Script.get('count'); // 0 (initial)
```

### **Jump to Specific Point**

```javascript
// Get history
const history = app.Script.getHistory();

console.log(history);
// [
//   { epoch: 0, signals: {...}, timestamp: 1234567890 },
//   { epoch: 1, signals: {...}, timestamp: 1234567891 },
//   { epoch: 2, signals: {...}, timestamp: 1234567892 }
// ]

// Jump to specific epoch
app.Script.jumpTo(1);

// All signals restored to that point in time!
```

### **History Inspection**

```javascript
// Get all signals at current state
const allSignals = app.Script.getAllSignals();

console.log(allSignals);
// {
//   count: 5,
//   username: 'John',
//   todos: [...],
//   ...
// }

// Get specific history frame
const history = app.Script.getHistory();
const frame = history[2];

console.log('Epoch:', frame.epoch);
console.log('Timestamp:', new Date(frame.timestamp));
console.log('Signals:', frame.signals);
console.log('Actions:', frame.actions);
```

### **Practical Use Cases**

```javascript
// Undo/Redo for text editor
const Editor = HTMLScrollMesh(
  ({ text }) => `
    <textarea>${text}</textarea>
    <button class="undo">⬅️ Undo</button>
    <button class="redo">➡️ Redo</button>
  `,
  
  (events, state) => {
    let history = [];
    let historyIndex = -1;
    
    events.on('input', 'textarea', (e) => {
      // Save to history
      history = history.slice(0, historyIndex + 1);
      history.push(e.target.value);
      historyIndex = history.length - 1;
      
      state.text = e.target.value;
    });
    
    events.on('click', '.undo', () => {
      if (historyIndex > 0) {
        historyIndex--;
        state.text = history[historyIndex];
      }
    });
    
    events.on('click', '.redo', () => {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        state.text = history[historyIndex];
      }
    });
  },
  
  () => ({ text: '' })
);

// Or use ScrollScript's built-in time-travel!
const Editor = HTMLScrollMesh(
  ({ text }) => `
    <textarea>${text}</textarea>
    <button class="undo">⬅️ Undo</button>
  `,
  
  (events, state) => {
    events.on('input', 'textarea', (e) => {
      app.Script.set('editorText', e.target.value);
    });
    
    events.on('click', '.undo', () => {
      app.Script.undo();  // Built-in!
      state.text = app.Script.get('editorText');
    });
  },
  
  () => ({ text: app.Script.get('editorText') })
);
```

---

## 🌐 Server-Side ScrollScript

ScrollScript works **identically on the server**!

### **Basic Server Setup**

```javascript
import { ScrollScriptServer } from 'scrollforge/script';

const server = new ScrollScriptServer();

// Signals work the same!
server.signal('visitors', 0);
server.signal('users', []);

// Routes
server.get('/api/visitors', (req, res) => {
  const count = server.get('visitors');
  server.set('visitors', count + 1);
  
  server.json(res, { 
    visitors: count + 1 
  });
});

// Actions work the same!
server.action('USER_JOINED', (payload) => {
  const users = server.get('users');
  server.set('users', [...users, payload.user]);
});

// Trigger actions
server.trigger('USER_JOINED', { user: { name: 'Alice' } });

// Start server
server.listen(3000);
```

### **Auto-Sync to Clients**

```javascript
import { ScrollScriptServerUltimate } from 'scrollforge/script';

const server = new ScrollScriptServerUltimate();

// Create signals
server.signal('liveCount', 0);
server.signal('users', []);

// Enable auto-sync (broadcasts to all connected clients!)
server.autoSync('liveCount');
server.autoSync('users');

// Any change broadcasts instantly!
server.set('liveCount', 42);
// → All connected WebSocket clients receive update! ✨

server.listen(3000);
```

### **Client-Server Integration**

**Server:**
```javascript
const server = new ScrollScriptServerUltimate();

server.signal('messages', []);
server.autoSync('messages');

// WebSocket channel
const chat = server.channel('chat');

chat.on('NEW_MESSAGE', (data) => {
  const messages = server.get('messages');
  server.set('messages', [...messages, data]);
  // Auto-broadcasts to all clients!
});

server.listen(3000);
```

**Client:**
```javascript
const app = new ScrollForge();

// Create matching signal
app.Script.signal('messages', []);

// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.signal === 'messages') {
    // Server auto-sync update
    app.Script.set('messages', msg.value);
    // UI auto-updates! ✨
  }
};

// Send message
function sendMessage(text) {
  ws.send(JSON.stringify({
    type: 'NEW_MESSAGE',
    data: { text, user: 'John' }
  }));
}
```

---

## 🌐 Network Features

### **Network Signals (Auto-Created)**

```javascript
// These signals are created automatically:
app.Script.get('net.status')    // 'online' | 'offline'
app.Script.get('net.loading')   // boolean
app.Script.get('net.latency')   // milliseconds
app.Script.get('net.requests')  // [{id, url, method, startedAt}]
app.Script.get('net.errors')    // [{status, url, timestamp}]
app.Script.get('net.progress')  // 0-100

// Watch network status
app.Script.watch('net.status', (status) => {
  if (status === 'offline') {
    alert('You are offline!');
    app.Script.set('offlineMode', true);
  } else {
    app.Script.set('offlineMode', false);
  }
});

// Watch loading state
app.Script.watch('net.loading', (loading) => {
  if (loading) {
    document.body.classList.add('loading');
  } else {
    document.body.classList.remove('loading');
  }
});

// Track latency
app.Script.watch('net.latency', (latency) => {
  if (latency > 1000) {
    console.warn('⚠️ Slow connection:', latency, 'ms');
  }
});
```

---

## 🎯 Advanced Patterns

### **Pattern 1: State Machines**

```javascript
app.Script.signal('authState', 'idle');
// States: idle, loading, authenticated, error

app.Script.action('LOGIN_START', () => {
  app.Script.set('authState', 'loading');
});

app.Script.action('LOGIN_SUCCESS', (payload) => {
  app.Script.set('authState', 'authenticated');
  app.Script.set('user', payload.user);
});

app.Script.action('LOGIN_ERROR', (payload) => {
  app.Script.set('authState', 'error');
  app.Script.set('errorMessage', payload.error);
});

app.Script.action('LOGOUT', () => {
  app.Script.set('authState', 'idle');
  app.Script.set('user', null);
});

// Watch state transitions
app.Script.watch('authState', (state, oldState) => {
  console.log(`Auth state: ${oldState} → ${state}`);
  
  switch (state) {
    case 'loading':
      showLoadingSpinner();
      break;
    case 'authenticated':
      hideLoadingSpinner();
      redirectToDashboard();
      break;
    case 'error':
      hideLoadingSpinner();
      showError();
      break;
  }
});
```

### **Pattern 2: Request Deduplication**

```javascript
const pendingRequests = new Map();

app.Script.action('FETCH_USER', async (payload) => {
  const userId = payload.userId;
  
  // Check if already fetching
  if (pendingRequests.has(userId)) {
    console.log('Already fetching user', userId);
    return pendingRequests.get(userId);
  }
  
  // Mark as pending
  const promise = fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(user => {
      app.Script.set('currentUser', user);
      pendingRequests.delete(userId);
      return user;
    })
    .catch(error => {
      pendingRequests.delete(userId);
      throw error;
    });
  
  pendingRequests.set(userId, promise);
  return promise;
});
```

### **Pattern 3: Optimistic Updates**

```javascript
app.Script.action('LIKE_POST', async (payload) => {
  const posts = app.Script.get('posts');
  const postId = payload.postId;
  
  // Optimistic update - update UI immediately
  const optimisticPosts = posts.map(p => 
    p.id === postId 
      ? { ...p, liked: true, likes: p.likes + 1 }
      : p
  );
  app.Script.set('posts', optimisticPosts);
  
  try {
    // Send to server
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    console.log('✅ Like confirmed by server');
  } catch (error) {
    // Rollback on error
    console.error('❌ Like failed - rolling back');
    app.Script.set('posts', posts);  // Restore original
  }
});
```

### **Pattern 4: Batch Updates**

```javascript
// Bad - multiple individual updates
app.Script.set('user', newUser);      // Triggers watchers
app.Script.set('settings', newSettings);  // Triggers watchers
app.Script.set('preferences', newPrefs);  // Triggers watchers
// Component re-renders 3 times!

// Better - batch through action
app.Script.action('UPDATE_PROFILE', (payload) => {
  app.Script.set('user', payload.user);
  app.Script.set('settings', payload.settings);
  app.Script.set('preferences', payload.preferences);
  // ScrollScript batches these - component re-renders once!
});

app.Script.trigger('UPDATE_PROFILE', {
  user: newUser,
  settings: newSettings,
  preferences: newPrefs
});
```

### **Pattern 5: Signal Namespacing**

```javascript
// Instead of flat structure:
app.Script.signal('userName', '');
app.Script.signal('userEmail', '');
app.Script.signal('userAge', 0);

// Use nested signals:
app.Script.signal('user', {
  name: '',
  email: '',
  age: 0,
  preferences: {
    theme: 'dark',
    language: 'en'
  }
});

// Cleaner updates
const user = app.Script.get('user');
app.Script.set('user', {
  ...user,
  email: 'new@email.com'
});
```

### **Pattern 6: Command Pattern**

```javascript
// Store command history for undo/redo
app.Script.signal('commandHistory', []);
app.Script.signal('commandIndex', -1);

class Command {
  constructor(execute, undo) {
    this.execute = execute;
    this.undo = undo;
  }
}

function executeCommand(command) {
  const history = app.Script.get('commandHistory');
  const index = app.Script.get('commandIndex');
  
  // Remove future commands
  const newHistory = history.slice(0, index + 1);
  
  // Execute and add to history
  command.execute();
  newHistory.push(command);
  
  app.Script.set('commandHistory', newHistory);
  app.Script.set('commandIndex', newHistory.length - 1);
}

function undoCommand() {
  const index = app.Script.get('commandIndex');
  if (index < 0) return;
  
  const history = app.Script.get('commandHistory');
  history[index].undo();
  
  app.Script.set('commandIndex', index - 1);
}

function redoCommand() {
  const index = app.Script.get('commandIndex');
  const history = app.Script.get('commandHistory');
  
  if (index >= history.length - 1) return;
  
  history[index + 1].execute();
  app.Script.set('commandIndex', index + 1);
}

// Usage
const addTodoCommand = new Command(
  () => {
    const todos = app.Script.get('todos');
    app.Script.set('todos', [...todos, { id: 1, text: 'New' }]);
  },
  () => {
    const todos = app.Script.get('todos');
    app.Script.set('todos', todos.filter(t => t.id !== 1));
  }
);

executeCommand(addTodoCommand);
```

---

## 🚀 Performance Optimization

### **1. Memoization with Derived Signals**

```javascript
// ❌ BAD - Recalculates every render
({ users }) => {
  const activeUsers = users.filter(u => u.active);  // Every render!
  return `<div>${activeUsers.length} active</div>`;
}

// ✅ GOOD - Use derived signal
app.Script.signal('users', []);

app.Script.derived('activeUsers', () => {
  const users = app.Script.get('users');
  return users.filter(u => u.active);
}, ['users']);

// Only recalculates when users changes!
({ activeUsers }) => {
  return `<div>${activeUsers.length} active</div>`;
}
```

### **2. Selective Watching**

```javascript
// ❌ BAD - Watch entire object
app.Script.watch('appState', (newState) => {
  // Fires on ANY property change
  updateEverything();
});

// ✅ GOOD - Watch specific derived signals
app.Script.derived('userTheme', () => {
  const appState = app.Script.get('appState');
  return appState.user.preferences.theme;
}, ['appState']);

app.Script.watch('userTheme', (theme) => {
  // Only fires when theme changes
  applyTheme(theme);
});
```

### **3. Debounce Expensive Operations**

```javascript
// ❌ BAD - Saves on every change
app.Script.watch('document', (doc) => {
  saveToServer(doc);  // Every keystroke!
});

// ✅ GOOD - Debounce
let saveTimer;
app.Script.watch('document', (doc) => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToServer(doc);
  }, 1000);  // Save 1s after last change
});
```

### **4. Batch Signal Updates**

```javascript
// ❌ BAD - Multiple separate updates
function loadUserData(userData) {
  app.Script.set('user', userData.user);
  app.Script.set('settings', userData.settings);
  app.Script.set('preferences', userData.preferences);
  app.Script.set('notifications', userData.notifications);
  // 4 separate updates, 4 re-renders!
}

// ✅ GOOD - Single action
app.Script.action('LOAD_USER_DATA', (payload) => {
  app.Script.set('user', payload.user);
  app.Script.set('settings', payload.settings);
  app.Script.set('preferences', payload.preferences);
  app.Script.set('notifications', payload.notifications);
  // Batched internally - single re-render!
});

app.Script.trigger('LOAD_USER_DATA', userData);
```

---

## ⚠️ Common Pitfalls & Solutions

### **Pitfall 1: Data Vanishes on Refresh**

**Problem:**
```javascript
// ❌ Data vanishes!
app.Script.signal('todos', []);
app.Script.persist('todos');  // Async load - too late!

() => ({
  todos: app.Script.get('todos')  // Gets [] before localStorage loads!
})
```

**Solution:**
```javascript
// ✅ Load in state function
() => ({
  todos: JSON.parse(localStorage.getItem('todos') || '[]')
}),

(state, effects) => {
  effects.when('todos', (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos));
  });
}
```

---

### **Pitfall 2: Direct Mutations Don't Trigger Updates**

**Problem:**
```javascript
// ❌ Doesn't trigger watchers!
const user = app.Script.get('user');
user.name = 'Jane';  // Direct mutation

const todos = app.Script.get('todos');
todos.push(newTodo);  // Direct mutation
```

**Solution:**
```javascript
// ✅ Immutable updates
const user = app.Script.get('user');
app.Script.set('user', { ...user, name: 'Jane' });

const todos = app.Script.get('todos');
app.Script.set('todos', [...todos, newTodo]);
```

---

### **Pitfall 3: Input Refreshing on Every Keystroke**

**Problem:**
```javascript
// ❌ Page refreshes while typing!
({ inputValue }) => `<input value="${inputValue}">`,

events.on('input', 'input', (e) => {
  state.inputValue = e.target.value;  // Triggers re-render!
})
```

**Solution:**
```javascript
// ✅ Uncontrolled input
() => `<input class="my-input">`,  // No value binding!

events.on('keydown', '.my-input', (e) => {
  if (e.key === 'Enter') {
    // Only update state on submit
    state.data = e.target.value;
    e.target.value = '';
  }
})
```

---

### **Pitfall 4: Memory Leaks from Watchers**

**Problem:**
```javascript
// ❌ Creates new watcher every render!
function MyComponent() {
  render() {
    app.Script.watch('data', (data) => {
      console.log(data);
    });
    // Never unsubscribes - memory leak!
  }
}
```

**Solution:**
```javascript
// ✅ Store unsubscribe function
class MyComponent {
  constructor() {
    this.unwatchers = [];
  }
  
  mount() {
    this.unwatchers.push(
      app.Script.watch('data', this.handleData)
    );
  }
  
  unmount() {
    // Clean up all watchers
    this.unwatchers.forEach(unwatch => unwatch());
    this.unwatchers = [];
  }
}
```

---

### **Pitfall 5: Circular Dependencies in Derived Signals**

**Problem:**
```javascript
// ❌ Circular dependency!
app.Script.derived('a', () => {
  return app.Script.get('b') + 1;
}, ['b']);

app.Script.derived('b', () => {
  return app.Script.get('a') + 1;
}, ['a']);

// Infinite loop! 💀
```

**Solution:**
```javascript
// ✅ Use base signals
app.Script.signal('baseValue', 0);

app.Script.derived('a', () => {
  return app.Script.get('baseValue') * 2;
}, ['baseValue']);

app.Script.derived('b', () => {
  return app.Script.get('baseValue') * 3;
}, ['baseValue']);

// No circular dependency!
```

---

### **Pitfall 6: Too Many Watchers**

**Problem:**
```javascript
// ❌ 100 separate watchers!
for (let i = 0; i < 100; i++) {
  app.Script.watch('data', (data) => {
    updateItem(i, data);
  });
}
```

**Solution:**
```javascript
// ✅ Single watcher
app.Script.watch('data', (data) => {
  for (let i = 0; i < 100; i++) {
    updateItem(i, data);
  }
});

// Or use derived signal
app.Script.derived('processedData', () => {
  const data = app.Script.get('data');
  return data.map((item, i) => processItem(i, item));
}, ['data']);
```

---

## 📚 Complete API Reference

### **Signal Management**

```javascript
// Create signal
app.Script.signal(name, initialValue, scope)

// Get value
app.Script.get(name)

// Set value
app.Script.set(name, value)

// Watch changes
app.Script.watch(name, callback)

// Derived signals
app.Script.derived(name, computeFn, dependencies, scope)

// Remove signal
app.Script.removeSignal(name)

// Get all signals
app.Script.getAllSignals()
```

### **Actions**

```javascript
// Register action
app.Script.action(type, handler, options)

// Trigger action
app.Script.trigger(type, payload, scope)

// Remove action
app.Script.removeAction(type)

// Get action queue
app.Script.getActionQueue()
```

### **Event Bindings (Client)**

```javascript
// Keyboard
app.Script.onKey(key, actionType, payload)

// Clicks
app.Script.onClick(selector, actionType, payloadExtractor)

// Forms
app.Script.onSubmit(selector, actionType)
app.Script.onInput(selector, actionType)

// Scroll
app.Script.onScroll(actionType, throttleMs)

// Pointer
app.Script.onPointer(actionType, throttleMs)

// Intersection
app.Script.onIntersect(selector, actionType, options)

// Animation frame
app.Script.onFrame(actionType)

// Generic event
app.Script.on(selector, eventType, actionType, payloadExtractor)
```

### **Utilities**

```javascript
// Debounce
app.Script.debounce(actionType, delayMs)

// Throttle
app.Script.throttle(actionType, delayMs)

// Persistence (async - don't use for initial load!)
app.Script.persist(signalName, storageKey)

// Cross-tab sync
app.Script.sync(signalName)
```

### **Time-Travel**

```javascript
// Undo
app.Script.undo()

// Redo (if supported)
app.Script.redo()

// Jump to epoch
app.Script.jumpTo(epoch)

// Get history
app.Script.getHistory()

// Get current epoch
app.Script.getCurrentEpoch()
```

### **Lifecycle**

```javascript
// Reset all signals and actions
app.Script.reset()

// Clear history
app.Script.clearHistory()

// Disable time-travel
app.Script.disableTimeTravel()

// Enable time-travel
app.Script.enableTimeTravel()
```

---

## 🎓 Real-World Examples

### **Example 1: Complete Todo App with Persistence**

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

window.app = new ScrollForge();

const TodoApp = HTMLScrollMesh(
  // UI
  ({ todos, filter, stats }) => `
    <div class="todo-app">
      <h1>📝 ScrollForge Todos</h1>
      <p>${stats.active} active, ${stats.completed} completed</p>
      
      <input class="new-todo" placeholder="What needs to be done?" />
      
      <ul>
        ${todos
          .filter(t => {
            if (filter === 'active') return !t.completed;
            if (filter === 'completed') return t.completed;
            return true;
          })
          .map(t => `
            <li class="${t.completed ? 'done' : ''}">
              <input type="checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}">
              <span>${t.text}</span>
              <button class="delete" data-id="${t.id}">×</button>
            </li>
          `).join('')}
      </ul>
      
      <div class="filters">
        <button class="filter ${filter === 'all' ? 'active' : ''}" data-filter="all">
          All (${todos.length})
        </button>
        <button class="filter ${filter === 'active' ? 'active' : ''}" data-filter="active">
          Active (${stats.active})
        </button>
        <button class="filter ${filter === 'completed' ? 'active' : ''}" data-filter="completed">
          Completed (${stats.completed})
        </button>
      </div>
    </div>
  `,
  
  // Logic
  (events, state) => {
    // Add todo
    events.on('keydown', '.new-todo', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        state.todos = [...state.todos, {
          id: Date.now(),
          text: e.target.value.trim(),
          completed: false,
          createdAt: new Date().toISOString()
        }];
        e.target.value = '';
      }
    });
    
    // Toggle todo
    events.on('change', 'input[type="checkbox"]', (e) => {
      const id = parseInt(e.target.dataset.id);
      state.todos = state.todos.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      );
    });
    
    // Delete todo
    events.on('click', '.delete', (e) => {
      const id = parseInt(e.target.dataset.id);
      state.todos = state.todos.filter(t => t.id !== id);
    });
    
    // Filter
    events.on('click', '.filter', (e) => {
      state.filter = e.target.dataset.filter;
    });
  },
  
  // ✅ CORRECT: Load from localStorage in state function
  () => ({
    todos: JSON.parse(localStorage.getItem('scrollforge_todos') || '[]'),
    filter: localStorage.getItem('scrollforge_filter') || 'all',
    
    // Computed stats
    computed: {
      stats: (state) => ({
        total: state.todos.length,
        active: state.todos.filter(t => !t.completed).length,
        completed: state.todos.filter(t => t.completed).length
      })
    }
  }),
  
  // ✅ CORRECT: Save in effects
  (state, effects) => {
    effects.when('todos', (todos) => {
      localStorage.setItem('scrollforge_todos', JSON.stringify(todos));
      console.log(`💾 Saved ${todos.length} todos`);
    });
    
    effects.when('filter', (filter) => {
      localStorage.setItem('scrollforge_filter', filter);
    });
  }
);

TodoApp.mount('#app');
```

---

### **Example 2: User Authentication with Persistence**

```javascript
const AuthApp = HTMLScrollMesh(
  ({ isLoggedIn, user }) => {
    if (!isLoggedIn) {
      return `
        <div class="login">
          <input class="email" type="email" placeholder="Email" />
          <input class="password" type="password" placeholder="Password" />
          <button class="login-btn">Login</button>
        </div>
      `;
    }
    
    return `
      <div class="dashboard">
        <h1>Welcome, ${user.name}!</h1>
        <button class="logout-btn">Logout</button>
      </div>
    `;
  },
  
  (events, state) => {
    events.on('click', '.login-btn', async () => {
      const email = document.querySelector('.email').value;
      const password = document.querySelector('.password').value;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          state.user = data.user;
          state.isLoggedIn = true;
          state.token = data.token;
        } else {
          alert('Login failed: ' + data.error);
        }
      } catch (error) {
        alert('Network error');
      }
    });
    
    events.on('click', '.logout-btn', () => {
      state.user = null;
      state.isLoggedIn = false;
      state.token = null;
    });
  },
  
  // ✅ Load auth state
  () => {
    const saved = localStorage.getItem('auth');
    
    if (saved) {
      try {
        const auth = JSON.parse(saved);
        
        // Check if token is still valid (not expired)
        if (auth.expiresAt > Date.now()) {
          return {
            isLoggedIn: true,
            user: auth.user,
            token: auth.token
          };
        }
      } catch (error) {
        console.error('Failed to load auth:', error);
      }
    }
    
    return {
      isLoggedIn: false,
      user: null,
      token: null
    };
  },
  
  // ✅ Save auth state
  (state, effects) => {
    // Watch login state
    effects.when('isLoggedIn', (isLoggedIn) => {
      if (isLoggedIn) {
        // Save auth data
        const auth = {
          user: state.user,
          token: state.token,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)  // 24 hours
        };
        localStorage.setItem('auth', JSON.stringify(auth));
      } else {
        // Clear on logout
        localStorage.removeItem('auth');
      }
    });
  }
);
```

---

## 🎯 Summary - The Golden Rules

### **1. Shared Variables Theory**
- ✅ All state is global and accessible
- ✅ Single dispatcher manages all actions
- ✅ Functions connect through shared signals

### **2. Persistence Pattern**
- ✅ **LOAD** in state function: `JSON.parse(localStorage.getItem('key') || 'default')`
- ✅ **SAVE** in effects: `localStorage.setItem('key', JSON.stringify(value))`
- ❌ **NEVER** use `app.Script.persist()` for initial load (it's async!)

### **3. Immutability**
- ✅ Always use immutable updates: `app.Script.set('arr', [...arr, item])`
- ❌ Never mutate directly: `arr.push(item)` won't trigger updates!

### **4. Performance**
- ✅ Use derived signals for computed values
- ✅ Batch updates through actions
- ✅ Debounce expensive operations
- ✅ Unsubscribe watchers when done

### **5. Causal Graph**
- ✅ Event → Action → State → Effect
- ✅ Make causality explicit
- ✅ Use time-travel for debugging
- ✅ Trust the shared variables!

---

🔥 **ScrollScript - The Universal Data Flow Engine** 🔥

**Built on Shared Variables Theory**
**Powering Causal Graph Programming**
**Client + Server Unified** ✨

---

**Every signal, every action, every pattern - explained in complete detail!**

**Master ScrollScript = Master Causal Graph Programming** 🚀

