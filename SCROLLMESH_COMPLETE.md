# 🏗️ ScrollMesh Complete Guide

**Recursive Component Assembly Engine**

> *"Messy backend, clean frontend. Unlimited functions auto-wire through context."*

---

## 📚 **TABLE OF CONTENTS**

1. [Philosophy - Organized Chaos](#philosophy---organized-chaos)
2. [The 4 Rendering Modes](#the-4-rendering-modes)
3. [Context Auto-Wiring - THE BREAKTHROUGH](#context-auto-wiring---the-breakthrough)
4. [The 8 Available Contexts](#the-8-available-contexts)
5. [State Management in Depth](#state-management-in-depth)
6. [Computed Properties & Selectors](#computed-properties--selectors)
7. [Middleware & Validation](#middleware--validation)
8. [Event System](#event-system)
9. [Effects & Side Effects](#effects--side-effects)
10. [Reactive Components](#reactive-components)
11. [Blueprints (Original Mode)](#blueprints-original-mode)
12. [HTML Template Mode](#html-template-mode)
13. [Helpers & Utilities](#helpers--utilities)
14. [Performance & Optimization](#performance--optimization)
15. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
16. [Complete API Reference](#complete-api-reference)

---

## 🎯 Philosophy - Organized Chaos

### **The Messy Backend Pattern**

> *"Complexity lives inside. Simplicity lives outside. The framework manages the chaos."*

**Traditional Approach:**
```javascript
// Complex props drilling
<App>
  <Header user={user} theme={theme} onLogout={handleLogout} />
  <Sidebar collapsed={collapsed} onToggle={handleToggle} theme={theme} />
  <Content 
    data={data} 
    user={user} 
    theme={theme}
    onUpdate={handleUpdate}
    onDelete={handleDelete}
    onShare={handleShare}
  />
</App>

// Callback hell
function Content({ onUpdate, onDelete, onShare }) {
  return (
    <Item 
      onUpdate={onUpdate}
      onDelete={onDelete}
      onShare={onShare}
    />
  );
}
```

**ScrollMesh Approach:**
```javascript
// Messy backend - complex logic hidden inside
ScrollMesh(
  // Function 1: UI (clean facade)
  ({ count, message, status }) => `<div>${message}: ${count}</div>`,
  
  // Function 2: Styling (messy calculations)
  (state, weave) => {
    const color = calculateOptimalColor(state);
    const size = determineResponsiveSize(state);
    weave.apply('div', { color, fontSize: size });
  },
  
  // Function 3: Click logic (messy business rules)
  (events, state) => {
    events.on('click', 'div', () => {
      if (validateClick(state)) {
        const newCount = applyBusinessRules(state.count);
        state.count = newCount;
        logAnalytics('click', newCount);
      }
    });
  },
  
  // Function 4: Hover effects
  (events, state, weave) => {
    events.on('mouseenter', 'div', () => {
      weave.spring('div', { transform: 'scale(1.1)' });
    });
  },
  
  // Function 5: Keyboard shortcuts
  (events, state) => {
    events.on('keydown', 'body', (e) => {
      if (e.key === '+') state.count++;
      if (e.key === '-') state.count--;
    });
  },
  
  // ... add 10 more functions if you want!
  
  // Clean state definition
  () => ({ count: 0, message: 'Count', status: 'active' })
);

// ALL functions auto-connect!
// NO manual wiring!
// Messy logic stays hidden!
```

### **Why This Is Revolutionary**

**1. Unlimited Functions**
- Add as many functions as needed
- Each handles ONE concern
- Framework wires them automatically

**2. Auto-Detection**
- Framework reads function signatures
- Automatically provides needed contexts
- Zero configuration required

**3. Separation of Concerns**
- UI function = pure templates
- Logic functions = event handlers
- Effect functions = side effects
- State function = data definition

**4. No Props Drilling**
- All functions access shared state
- No passing props through layers
- Context provides what's needed

---

## 🎨 The 4 Rendering Modes

ScrollMesh supports **FOUR different ways** to build components!

### **Mode 1: Blueprints (Original JS Objects)**

```javascript
app.Mesh.blueprint('Button', (props) => ({
  tag: 'button',
  attrs: { class: 'btn' },
  content: props.label,
  events: { click: props.onClick }
}));

const button = app.Mesh.create('Button', {
  label: 'Click me',
  onClick: () => console.log('Clicked!')
});

app.Mesh.render(button, '#app');
```

### **Mode 2: Reactive Components**

```javascript
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

### **Mode 3: Context Auto-Wiring (THE BREAKTHROUGH)**

```javascript
import { ScrollMesh } from 'scrollforge/mesh';

const Counter = ScrollMesh(
  ({ count }) => ({ tag: 'button', content: count }),
  (events, state) => {
    events.on('click', 'button', () => state.count++);
  },
  () => ({ count: 0 })
);

Counter.mount('#app');
```

### **Mode 4: HTML Templates**

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

const Counter = HTMLScrollMesh(
  ({ count }) => `<button>${count}</button>`,
  (events, state) => {
    events.on('click', 'button', () => state.count++);
  },
  () => ({ count: 0 })
);

Counter.mount('#app');
```

---

## 🔥 Context Auto-Wiring - THE BREAKTHROUGH

### **The Core Concept**

> *"Pass unlimited functions. They auto-detect what they need. They auto-connect. Everything works."*

**Syntax:**
```javascript
import { ScrollMesh } from 'scrollforge/mesh';
// or
import { HTMLScrollMesh } from 'scrollforge/mesh';

const component = ScrollMesh(
  function1,
  function2,
  function3,
  // ... unlimited!
);

// or HTML mode
const component = HTMLScrollMesh(
  function1,
  function2,
  function3,
  // ... unlimited!
);
```

### **How Auto-Detection Works**

**The framework reads function signatures:**

```javascript
ScrollMesh(
  // Function with ({ count }) parameter
  // → Framework detects: "This needs state with count property"
  // → Provides: state object
  ({ count }) => ({ tag: 'div', content: count }),
  
  // Function with (events, state) parameters
  // → Framework detects: "This needs events AND state"
  // → Provides: events context + state object
  (events, state) => {
    events.on('click', 'div', () => state.count++);
  },
  
  // Function with () that returns object
  // → Framework detects: "This is the state provider"
  // → Uses: return value as initial state
  () => ({ count: 0 })
);

// Framework automatically:
// 1. Identifies state function (returns object)
// 2. Creates reactive state from it
// 3. Identifies UI function (destructures state)
// 4. Identifies logic function (uses events + state)
// 5. Wires them all together!
// 6. Renders and manages lifecycle!
```

### **Parameter Detection Rules**

| Function Signature | Detected As | Gets |
|-------------------|-------------|------|
| `({ prop }) => ...` | UI Function | State object (destructured) |
| `(state) => ...` | Logic/Effect | State proxy object |
| `(events) => ...` | Logic | Events context |
| `(events, state) => ...` | Logic | Events + State |
| `(state, weave) => ...` | Styling | State + Weave |
| `(state, effects) => ...` | Effects | State + Effects |
| `(state, api) => ...` | API | State + API |
| `(storage) => ...` | Storage | Storage context |
| `(validate) => ...` | Validation | Validate context |
| `(analytics) => ...` | Analytics | Analytics context |
| `() => ({ ... })` | State Provider | Nothing (returns state) |
| `(state, events, weave, effects) => ...` | Any Combo | All requested contexts |

### **Function Order Doesn't Matter!**

```javascript
// These all work the same:

// Order 1
ScrollMesh(
  uiFunction,
  logicFunction,
  stateFunction
);

// Order 2
ScrollMesh(
  stateFunction,
  uiFunction,
  logicFunction
);

// Order 3
ScrollMesh(
  logicFunction,
  stateFunction,
  uiFunction
);

// Framework detects by signature, not position!
```

---

## 🎨 The 8 Available Contexts

### **1. `state` - Reactive State**

**What it is:** Proxy object that triggers re-renders on changes

**How to get it:** Any function with `state` parameter

**What you can do:**
```javascript
(state) => {
  // READ
  const count = state.count;
  const name = state.user.name;
  
  // WRITE - triggers re-render!
  state.count++;
  state.user.name = 'Jane';
  
  // Deep access works!
  state.user.profile.settings.theme = 'dark';
  
  // Arrays
  state.items.push(newItem);  // Triggers update
  state.items = [...state.items, newItem];  // Also triggers
  
  // Objects
  state.config.value = 123;  // Triggers update
  state.config = { ...state.config, value: 123 };  // Also triggers
}
```

**Example:**
```javascript
ScrollMesh(
  ({ count }) => `<div>${count}</div>`,
  
  (state) => {
    // Can read and write state
    console.log('Current count:', state.count);
    
    // Increment every second
    setInterval(() => {
      state.count++;  // Triggers re-render!
    }, 1000);
  },
  
  () => ({ count: 0 })
);
```

---

### **2. `events` - Event System**

**What it is:** Event delegation and custom events

**How to get it:** Any function with `events` parameter

**API:**
```javascript
(events) => {
  // Listen to DOM events
  events.on(eventType, selector, handler);
  
  // Stop listening
  events.off(eventType, selector, handler);
  
  // Emit custom events
  events.emit(eventName, data);
  
  // Listen to custom events
  events.on(eventName, handler);
}
```

**Examples:**

```javascript
(events, state) => {
  // Click
  events.on('click', '.button', (e) => {
    console.log('Button clicked!', e.target);
    state.count++;
  });
  
  // Input
  events.on('input', '.search', (e) => {
    state.searchQuery = e.target.value;
  });
  
  // Keydown
  events.on('keydown', 'body', (e) => {
    if (e.key === 'Escape') {
      state.modalOpen = false;
    }
  });
  
  // Submit
  events.on('submit', 'form', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.formData = Object.fromEntries(formData);
  });
  
  // Mouseenter
  events.on('mouseenter', '.card', (e) => {
    state.hoveredCard = e.target.dataset.id;
  });
  
  // Custom events
  events.emit('customEvent', { data: 'value' });
  
  events.on('customEvent', (data) => {
    console.log('Custom event fired:', data);
  });
  
  // Multiple handlers
  events.on('click', '.btn', handler1);
  events.on('click', '.btn', handler2);
  events.on('click', '.btn', handler3);
  // All fire on click!
}
```

**Event Delegation:**
```javascript
(events) => {
  // Works even for dynamically added elements!
  events.on('click', '.dynamic-item', (e) => {
    console.log('Clicked dynamic item');
  });
  
  // Add items later
  state.items = [...state.items, newItem];
  // Click handler still works! ✨
}
```

---

### **3. `effects` - Side Effects**

**What it is:** Run code in response to state changes

**How to get it:** Any function with `effects` parameter

**API:**
```javascript
(effects) => {
  // Watch state changes
  effects.when(propertyName, callback);
  
  // Run once on mount
  effects.once(eventName, callback);
}
```

**Examples:**

```javascript
(state, effects) => {
  // Watch single property
  effects.when('count', (count) => {
    console.log('Count changed to:', count);
    document.title = `Count: ${count}`;
  });
  
  // Watch multiple properties
  effects.when('username', (username) => {
    console.log('Username changed:', username);
  });
  
  effects.when('email', (email) => {
    console.log('Email changed:', email);
  });
  
  // Watch with old value
  effects.when('status', (newStatus, oldStatus) => {
    console.log(`Status: ${oldStatus} → ${newStatus}`);
  });
  
  // Run once on initialization
  effects.once('mounted', () => {
    console.log('Component mounted!');
    loadInitialData();
  });
  
  // Async effects
  effects.when('userId', async (userId) => {
    if (userId) {
      const user = await fetchUser(userId);
      state.user = user;
    }
  });
  
  // Save to localStorage
  effects.when('todos', (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos));
  });
  
  // Multiple effects on same property
  effects.when('score', (score) => {
    console.log('Score:', score);
  });
  
  effects.when('score', (score) => {
    if (score > 100) {
      alert('High score!');
    }
  });
  
  effects.when('score', (score) => {
    sendToAnalytics('score_updated', score);
  });
}
```

**Cleanup:**
```javascript
(state, effects) => {
  let interval;
  
  effects.once('mounted', () => {
    interval = setInterval(() => {
      state.time = Date.now();
    }, 1000);
  });
  
  effects.once('unmounted', () => {
    clearInterval(interval);
  });
}
```

---

### **4. `weave` - Styling (ScrollWeave Integration)**

**What it is:** Direct access to ScrollWeave for reactive styling

**How to get it:** Any function with `weave` parameter

**Examples:**

```javascript
(state, weave) => {
  // Apply styles
  weave.apply('.element', {
    background: 'blue',
    padding: '20px',
    borderRadius: '8px'
  });
  
  // Conditional styles
  weave.when('.button',
    state.isActive,
    { background: 'green', color: 'white' },
    { background: 'gray', color: 'black' }
  );
  
  // Switch-like
  weave.switch('.status', [
    { condition: state.status === 'loading', styles: { color: 'blue' } },
    { condition: state.status === 'success', styles: { color: 'green' } },
    { condition: state.status === 'error', styles: { color: 'red' } }
  ], { color: 'black' });
  
  // Animations
  weave.fadeIn('.modal', 300);
  weave.slideIn('.sidebar', 'left', 400);
  
  // Spring physics
  weave.spring('.card', {
    transform: 'translateY(0)',
    opacity: 1
  }, {
    stiffness: 200,
    damping: 20
  });
  
  // Reactive to state
  weave.apply('.progress-bar', {
    width: `${state.progress}%`,
    background: state.progress === 100 ? 'green' : 'blue'
  });
}
```

---

### **5. `api` - API Calls**

**What it is:** Helpers for making API calls with state integration

**How to get it:** Any function with `api` parameter

**Examples:**

```javascript
async (state, api) => {
  // Fetch when userId changes
  api.when('userId', async (userId) => {
    if (!userId) return;
    
    try {
      const response = await api.fetch(`/api/users/${userId}`);
      const user = await response.json();
      state.user = user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      state.error = error.message;
    }
  });
  
  // Fetch when multiple dependencies change
  api.when(['category', 'page'], async () => {
    const { category, page } = state;
    
    const response = await api.fetch(
      `/api/products?category=${category}&page=${page}`
    );
    const products = await response.json();
    state.products = products;
  });
  
  // Manual fetch
  async function loadData() {
    const response = await api.fetch('/api/data');
    const data = await response.json();
    state.data = data;
  }
}
```

---

### **6. `storage` - Persistence**

**What it is:** LocalStorage helpers

**How to get it:** Any function with `storage` parameter

**API:**
```javascript
(storage) => {
  // Save
  storage.persist(key, value);
  
  // Load (async)
  const value = await storage.load(key);
  
  // Remove
  storage.remove(key);
  
  // Clear all
  storage.clear();
}
```

**Examples:**

```javascript
(state, storage) => {
  // Load on mount
  const savedSettings = await storage.load('settings');
  if (savedSettings) {
    state.settings = savedSettings;
  }
  
  // Save when state changes
  storage.persist('settings', state.settings);
}

// With effects
(state, storage, effects) => {
  // Load initial data
  const savedTodos = await storage.load('todos');
  if (savedTodos) {
    state.todos = savedTodos;
  }
  
  // Auto-save on changes
  effects.when('todos', (todos) => {
    storage.persist('todos', todos);
  });
}
```

**⚠️ Important:** `storage.load()` is **async**, so don't use it in state function for initial load!

**✅ Correct pattern:**
```javascript
() => ({
  // Load synchronously in state function
  todos: JSON.parse(localStorage.getItem('todos') || '[]')
}),

(state, effects) => {
  // Save in effects
  effects.when('todos', (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos));
  });
}
```

---

### **7. `validate` - Validation**

**What it is:** Runtime validation rules

**How to get it:** Any function with `validate` parameter

**Examples:**

```javascript
(validate) => {
  // Add validation rules
  validate.rule('email', 
    (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Invalid email format'
  );
  
  validate.rule('age',
    (value) => value >= 18,
    'Must be 18 or older'
  );
  
  validate.rule('password',
    (value) => value.length >= 8,
    'Password must be at least 8 characters'
  );
  
  // Complex validation
  validate.rule('username', (value) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Too short (min 3)';
    if (value.length > 20) return 'Too long (max 20)';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, underscores';
    return true;  // Valid!
  });
}
```

**⚠️ Note:** Validation in state function runs on EVERY state change. For input fields, validate manually instead!

---

### **8. `analytics` - Analytics Tracking**

**What it is:** Track user interactions and metrics

**How to get it:** Any function with `analytics` parameter

**Examples:**

```javascript
(state, analytics) => {
  // Track simple events
  analytics.track('buttonClicked', () => state.clickCount);
  
  analytics.track('pageView', () => ({
    page: state.currentPage,
    user: state.username,
    timestamp: Date.now()
  }));
  
  // Track computed values
  analytics.track('cartValue', () => {
    return state.cartItems.reduce((sum, item) => 
      sum + item.price * item.quantity, 0
    );
  });
  
  // Track user interactions
  analytics.track('formCompleted', () => state.formSubmitted);
  analytics.track('errorsEncountered', () => state.errors.length);
  
  // Conditional tracking
  analytics.track('premiumFeatureUsed', () => {
    if (state.user.isPremium) {
      return state.premiumFeatureCount;
    }
    return 0;
  });
}
```

---

## 📦 State Management in Depth

### **State Function - The Foundation**

**Signature:**
```javascript
() => ({ /* state object */ })
```

**Rules:**
- ✅ Must take ZERO parameters
- ✅ Must return an object
- ✅ Framework identifies this as state provider
- ✅ Return value becomes reactive state

### **Basic State**

```javascript
() => ({
  // Primitives
  count: 0,
  message: 'Hello',
  isActive: false,
  temperature: 72.5,
  
  // Objects
  user: {
    name: 'John',
    email: 'john@example.com'
  },
  
  // Arrays
  items: [],
  todos: [
    { id: 1, text: 'Learn ScrollForge', done: true },
    { id: 2, text: 'Build amazing apps', done: false }
  ],
  
  // Nested structures
  appState: {
    ui: {
      sidebar: { open: false },
      modal: { visible: false, content: null }
    },
    data: {
      users: [],
      posts: []
    }
  }
})
```

### **State with Computed Properties**

```javascript
() => ({
  firstName: 'John',
  lastName: 'Doe',
  birthYear: 1990,
  
  // Computed properties - auto-update when dependencies change!
  computed: {
    fullName: (state) => `${state.firstName} ${state.lastName}`,
    
    age: (state) => new Date().getFullYear() - state.birthYear,
    
    initials: (state) => 
      `${state.firstName[0]}${state.lastName[0]}`.toUpperCase(),
    
    isAdult: (state) => {
      const age = new Date().getFullYear() - state.birthYear;
      return age >= 18;
    },
    
    // Can use other computed properties!
    greeting: (state) => {
      const age = new Date().getFullYear() - state.birthYear;
      return `Hello ${state.firstName}, you are ${age} years old!`;
    }
  }
})

// Access computed properties like regular state:
({ fullName, age, isAdult }) => `
  <div>
    <h2>${fullName}</h2>
    <p>Age: ${age}</p>
    <p>${isAdult ? 'Adult' : 'Minor'}</p>
  </div>
`
```

### **State with Selectors (Memoized)**

**What they are:** Computed values that are **memoized** (cached until dependencies change)

```javascript
() => ({
  users: [
    { id: 1, name: 'Alice', active: true, plan: 'premium' },
    { id: 2, name: 'Bob', active: false, plan: 'free' },
    { id: 3, name: 'Charlie', active: true, plan: 'free' }
  ],
  
  selectors: {
    // Only recalculates when users array changes
    activeUsers: (state) => 
      state.users.filter(u => u.active),
    
    premiumUsers: (state) => 
      state.users.filter(u => u.plan === 'premium'),
    
    freeUsers: (state) => 
      state.users.filter(u => u.plan === 'free'),
    
    userCount: (state) => state.users.length,
    
    activeCount: (state) => 
      state.users.filter(u => u.active).length,
    
    // Expensive computation - only runs when users changes!
    userStats: (state) => {
      const users = state.users;
      return {
        total: users.length,
        active: users.filter(u => u.active).length,
        premium: users.filter(u => u.plan === 'premium').length,
        averageAge: users.reduce((sum, u) => sum + (u.age || 0), 0) / users.length
      };
    }
  }
})

// Use selectors in UI
({ activeUsers, premiumUsers, userStats }) => `
  <div>
    <p>Active: ${activeUsers.length}</p>
    <p>Premium: ${premiumUsers.length}</p>
    <p>Stats: ${JSON.stringify(userStats)}</p>
  </div>
`
```

**Performance Benefit:**
```javascript
// ❌ BAD - Runs on EVERY render
({ users }) => {
  const activeUsers = users.filter(u => u.active);  // Every render!
  return `<div>${activeUsers.length}</div>`;
}

// ✅ GOOD - Memoized selector
selectors: {
  activeUsers: (state) => state.users.filter(u => u.active)
}

({ activeUsers }) => `<div>${activeUsers.length}</div>`
// Only recalculates when users changes!
```

---

### **State with Middleware**

**What it is:** Intercept state changes and modify them

```javascript
() => ({
  count: 0,
  email: '',
  age: 0,
  username: '',
  
  middleware: {
    // Prevent negative count
    count: (oldValue, newValue) => {
      console.log(`Count changing: ${oldValue} → ${newValue}`);
      return newValue < 0 ? 0 : newValue;
    },
    
    // Sanitize email
    email: (oldValue, newValue) => {
      return newValue.toLowerCase().trim();
    },
    
    // Clamp age
    age: (oldValue, newValue) => {
      return Math.max(0, Math.min(120, newValue));
    },
    
    // Clean username
    username: (oldValue, newValue) => {
      // Remove special characters, trim, lowercase
      return newValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, '');
    }
  }
})

// Try to set invalid values
state.count = -5;        // → Becomes 0
state.email = '  JOHN@EXAMPLE.COM  ';  // → Becomes 'john@example.com'
state.age = 150;         // → Becomes 120
state.username = 'John@123!';  // → Becomes 'john123'
```

**Use Cases:**
- Data sanitization
- Value clamping
- Format enforcement
- Security filtering

---

### **State with Validation**

**What it is:** Validate state changes and reject invalid values

```javascript
() => ({
  email: '',
  password: '',
  age: 0,
  
  validate: {
    email: (value) => {
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
      return true;  // Valid!
    },
    
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Min 8 characters';
      if (!/[A-Z]/.test(value)) return 'Need uppercase letter';
      if (!/[0-9]/.test(value)) return 'Need number';
      return true;
    },
    
    age: (value) => {
      if (value < 0) return 'Age cannot be negative';
      if (value > 120) return 'Invalid age';
      if (value < 18) return 'Must be 18+';
      return true;
    }
  },
  
  debug: {
    throwOnValidation: false  // Set to true to throw errors
  }
})

// Try invalid values
state.email = 'invalid';  
// Console: "Validation failed for email: Invalid email"
// Value is rejected if throwOnValidation: true
```

**⚠️ Important:** For input fields, **DON'T validate in state** (runs on every keystroke). Validate manually on submit instead!

**✅ Correct pattern:**
```javascript
() => ({
  email: '',
  password: ''
  // NO validate here!
}),

(events, state) => {
  events.on('click', '.submit', () => {
    // Validate manually
    if (!validateEmail(state.email)) {
      alert('Invalid email');
      return;
    }
    if (!validatePassword(state.password)) {
      alert('Invalid password');
      return;
    }
    
    // Submit
    submitForm(state);
  });
}
```

---

### **State with Immutability**

```javascript
() => ({
  user: { name: 'John', email: 'john@example.com' },
  settings: { theme: 'dark' },
  
  immutable: true  // Freeze state!
})

// Now direct mutations throw errors:
state.user.name = 'Jane';  // ❌ Error! Cannot modify frozen object

// Must use immutable updates:
state.user = { ...state.user, name: 'Jane' };  // ✅ Works!
```

**Benefits:**
- ✅ Prevents accidental mutations
- ✅ Enforces immutable patterns
- ✅ Easier debugging
- ✅ Better time-travel support

---

### **State with Transactions**

**What it is:** Atomic updates - all or nothing

```javascript
ScrollMesh(
  ({ accountA, accountB }) => `
    <div>
      <p>Account A: $${accountA}</p>
      <p>Account B: $${accountB}</p>
      <button class="transfer">Transfer $100</button>
    </div>
  `,
  
  (events, state) => {
    events.on('click', '.transfer', () => {
      state.transaction(() => {
        // All these changes happen atomically
        state.accountA -= 100;
        state.accountB += 100;
        state.transactionLog.push({
          from: 'A',
          to: 'B',
          amount: 100,
          timestamp: new Date()
        });
        
        // If this throws, EVERYTHING rolls back!
        if (state.accountA < 0) {
          throw new Error('Insufficient funds');
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

### **State with Debug Mode**

```javascript
() => ({
  count: 0,
  username: '',
  
  debug: {
    logChanges: true,           // Log all state changes
    breakOnChange: ['count'],   // Debugger breaks when count changes
    throwOnValidation: true,    // Throw on validation errors
    maxHistory: 100             // History size limit
  }
})

// Now when state changes:
state.count = 5;
// Console: "[State] count changed: 0 → 5"
// Debugger breaks (if breakOnChange includes 'count')
```

---

## 🎮 Event System

### **Event Types**

```javascript
(events, state) => {
  // Mouse events
  events.on('click', '.btn', handler);
  events.on('dblclick', '.item', handler);
  events.on('mouseenter', '.card', handler);
  events.on('mouseleave', '.card', handler);
  events.on('mousemove', '.canvas', handler);
  
  // Keyboard events
  events.on('keydown', 'body', handler);
  events.on('keyup', 'input', handler);
  events.on('keypress', 'textarea', handler);
  
  // Form events
  events.on('submit', 'form', handler);
  events.on('input', 'input', handler);
  events.on('change', 'select', handler);
  events.on('focus', '.field', handler);
  events.on('blur', '.field', handler);
  
  // Other events
  events.on('scroll', window, handler);
  events.on('resize', window, handler);
  events.on('load', window, handler);
}
```

### **Event Delegation**

```javascript
(events, state) => {
  // Works for current AND future elements!
  events.on('click', '.dynamic-item', (e) => {
    console.log('Clicked:', e.target.textContent);
  });
  
  // Add items dynamically
  state.items = [...state.items, 'New Item'];
  // Click handler STILL WORKS on new items! ✨
}
```

### **Multiple Handlers**

```javascript
(events, state) => {
  // Multiple handlers for same event
  events.on('click', '.btn', (e) => {
    console.log('Handler 1');
  });
  
  events.on('click', '.btn', (e) => {
    console.log('Handler 2');
  });
  
  events.on('click', '.btn', (e) => {
    console.log('Handler 3');
  });
  
  // All fire in order!
}
```

### **Event Removal**

```javascript
(events) => {
  const handler = (e) => {
    console.log('Clicked');
  };
  
  // Add
  events.on('click', '.btn', handler);
  
  // Remove
  events.off('click', '.btn', handler);
}
```

### **Custom Events**

```javascript
(events) => {
  // Emit custom event
  events.emit('dataLoaded', { 
    items: [1, 2, 3],
    timestamp: Date.now()
  });
  
  // Listen to custom event
  events.on('dataLoaded', (data) => {
    console.log('Data loaded:', data);
  });
}

// Different function can emit and listen
ScrollMesh(
  ({ items }) => `<div>${items.length} items</div>`,
  
  // Function 1: Emits event
  async (events, state) => {
    const items = await fetchItems();
    state.items = items;
    events.emit('itemsLoaded', items);
  },
  
  // Function 2: Listens to event
  (events) => {
    events.on('itemsLoaded', (items) => {
      console.log('Items loaded:', items.length);
      playSound();
    });
  },
  
  () => ({ items: [] })
);
```

---

## 🚀 Complete Real-World Examples

### **Example 1: Shopping Cart**

```javascript
const ShoppingCart = HTMLScrollMesh(
  // UI
  ({ cartItems, subtotal, tax, total, itemCount }) => `
    <div class="cart">
      <h2>🛒 Shopping Cart (${itemCount} items)</h2>
      
      ${cartItems.length === 0 ? `
        <p class="empty">Your cart is empty</p>
      ` : `
        <ul class="cart-items">
          ${cartItems.map(item => `
            <li class="cart-item">
              <span class="name">${item.name}</span>
              <span class="quantity">
                <button class="decrease" data-id="${item.id}">-</button>
                ${item.quantity}
                <button class="increase" data-id="${item.id}">+</button>
              </span>
              <span class="price">$${(item.price * item.quantity).toFixed(2)}</span>
              <button class="remove" data-id="${item.id}">×</button>
            </li>
          `).join('')}
        </ul>
        
        <div class="summary">
          <p>Subtotal: $${subtotal.toFixed(2)}</p>
          <p>Tax (8%): $${tax.toFixed(2)}</p>
          <h3>Total: $${total.toFixed(2)}</h3>
          <button class="checkout">Checkout</button>
        </div>
      `}
    </div>
  `,
  
  // Styling
  (state, weave) => {
    weave.when('.checkout',
      state.cartItems.length > 0,
      {
        background: '#4CAF50',
        cursor: 'pointer',
        opacity: 1
      },
      {
        background: '#ccc',
        cursor: 'not-allowed',
        opacity: 0.5
      }
    );
    
    weave.apply('.cart-item', {
      transition: 'all 0.3s ease'
    });
  },
  
  // Logic
  (events, state) => {
    // Increase quantity
    events.on('click', '.increase', (e) => {
      const id = parseInt(e.target.dataset.id);
      state.cartItems = state.cartItems.map(item =>
        item.id === id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    });
    
    // Decrease quantity
    events.on('click', '.decrease', (e) => {
      const id = parseInt(e.target.dataset.id);
      state.cartItems = state.cartItems.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
    
    // Remove item
    events.on('click', '.remove', (e) => {
      const id = parseInt(e.target.dataset.id);
      state.cartItems = state.cartItems.filter(item => item.id !== id);
    });
    
    // Checkout
    events.on('click', '.checkout', async () => {
      if (state.cartItems.length === 0) return;
      
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: state.cartItems,
            total: state.total
          })
        });
        
        if (response.ok) {
          alert('Order placed! 🎉');
          state.cartItems = [];
        }
      } catch (error) {
        alert('Checkout failed');
      }
    });
  },
  
  // State with persistence
  () => ({
    cartItems: JSON.parse(localStorage.getItem('cart') || '[]'),
    taxRate: 0.08,
    
    computed: {
      itemCount: (state) => 
        state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
      
      subtotal: (state) => 
        state.cartItems.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        ),
      
      tax: (state) => {
        const subtotal = state.cartItems.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        );
        return subtotal * state.taxRate;
      },
      
      total: (state) => {
        const subtotal = state.cartItems.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        );
        return subtotal + (subtotal * state.taxRate);
      }
    }
  }),
  
  // Persistence effects
  (state, effects) => {
    effects.when('cartItems', (cartItems) => {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      console.log(`💾 Saved ${cartItems.length} items`);
    });
  },
  
  // Analytics
  (state, analytics) => {
    analytics.track('cartValue', () => state.total);
    analytics.track('itemCount', () => state.itemCount);
  }
);

ShoppingCart.mount('#app');
```

---

### **Example 2: User Profile Editor**

```javascript
const ProfileEditor = HTMLScrollMesh(
  ({ user, errors, isSaving }) => `
    <div class="profile-editor">
      <h2>👤 Edit Profile</h2>
      
      <div class="field">
        <label>Name</label>
        <input class="name" value="${user.name}" />
        ${errors.name ? `<span class="error">${errors.name}</span>` : ''}
      </div>
      
      <div class="field">
        <label>Email</label>
        <input class="email" type="email" value="${user.email}" />
        ${errors.email ? `<span class="error">${errors.email}</span>` : ''}
      </div>
      
      <div class="field">
        <label>Bio</label>
        <textarea class="bio">${user.bio}</textarea>
        ${errors.bio ? `<span class="error">${errors.bio}</span>` : ''}
      </div>
      
      <button class="save" ${isSaving ? 'disabled' : ''}>
        ${isSaving ? 'Saving...' : 'Save Profile'}
      </button>
      
      <button class="undo">Undo Changes</button>
    </div>
  `,
  
  (events, state) => {
    // Track changes (controlled inputs)
    events.on('input', '.name', (e) => {
      state.user = { ...state.user, name: e.target.value };
    });
    
    events.on('input', '.email', (e) => {
      state.user = { ...state.user, email: e.target.value };
    });
    
    events.on('input', '.bio', (e) => {
      state.user = { ...state.user, bio: e.target.value };
    });
    
    // Save
    events.on('click', '.save', async () => {
      // Validate
      const errors = {};
      
      if (!state.user.name || state.user.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
      
      if (!state.user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.user.email)) {
        errors.email = 'Invalid email address';
      }
      
      if (state.user.bio.length > 500) {
        errors.bio = 'Bio too long (max 500 characters)';
      }
      
      state.errors = errors;
      
      if (Object.keys(errors).length > 0) {
        return;
      }
      
      // Save
      state.isSaving = true;
      
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.user)
        });
        
        alert('Profile saved! ✅');
        state.originalUser = { ...state.user };
      } catch (error) {
        alert('Failed to save');
      } finally {
        state.isSaving = false;
      }
    });
    
    // Undo
    events.on('click', '.undo', () => {
      state.user = { ...state.originalUser };
      state.errors = {};
    });
  },
  
  () => {
    const saved = JSON.parse(localStorage.getItem('user') || 'null');
    const defaultUser = { name: '', email: '', bio: '' };
    const user = saved || defaultUser;
    
    return {
      user,
      originalUser: { ...user },
      errors: {},
      isSaving: false
    };
  },
  
  (state, effects) => {
    effects.when('user', (user) => {
      localStorage.setItem('user', JSON.stringify(user));
    });
  }
);
```

---

## ⚡ Performance & Optimization

### **1. Use Selectors for Expensive Computations**

```javascript
() => ({
  items: new Array(10000).fill(0).map((_, i) => ({ 
    id: i, 
    value: Math.random() 
  })),
  
  selectors: {
    // Memoized - only runs when items changes
    expensiveComputation: (state) => {
      console.log('Running expensive computation...');
      return state.items
        .filter(i => i.value > 0.5)
        .map(i => ({ ...i, processed: true }))
        .sort((a, b) => b.value - a.value);
    }
  }
})
```

### **2. Debounce Expensive Effects**

```javascript
(state, effects) => {
  let saveTimer;
  
  effects.when('document', (doc) => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      // Save 1 second after last change
      localStorage.setItem('document', JSON.stringify(doc));
    }, 1000);
  });
}
```

### **3. Virtual Lists for Large Data**

```javascript
import { createVirtualList } from 'scrollforge/mesh';

const hugeArray = new Array(100000).fill(0).map((_, i) => `Item ${i}`);

const list = createVirtualList('#container', hugeArray, (item) => {
  const div = document.createElement('div');
  div.textContent = item;
  div.style.padding = '10px';
  return div;
}, {
  itemHeight: 40,
  overscan: 5
});

// Renders only visible items - smooth 60fps with 100k items!
```

### **4. Component Priority**

```javascript
// High priority - interactive elements
const Button = app.Mesh.component('Button', {
  priority: 'high',
  render() { /* ... */ }
});

// Normal priority (default)
const Content = app.Mesh.component('Content', {
  priority: 'normal',
  render() { /* ... */ }
});

// Low priority - background work
const Analytics = app.Mesh.component('Analytics', {
  priority: 'low',
  render() { /* ... */ }
});
```

---

## ⚠️ Common Pitfalls & Solutions

### **Pitfall 1: Input Value Binding Causes Refresh**

**Problem:**
```javascript
// ❌ Refreshes on every keystroke!
({ inputValue }) => `<input value="${inputValue}">`,

(events, state) => {
  events.on('input', 'input', (e) => {
    state.inputValue = e.target.value;  // Re-render!
  });
}
```

**Solution:**
```javascript
// ✅ Uncontrolled input - no refresh!
() => `<input class="my-input">`,  // No value binding

(events, state) => {
  events.on('keydown', '.my-input', (e) => {
    if (e.key === 'Enter') {
      state.data = e.target.value;  // Only update on submit
      e.target.value = '';
    }
  });
  
  // DON'T listen to 'input' event for text fields!
}
```

---

### **Pitfall 2: Forgetting to Return State Object**

**Problem:**
```javascript
// ❌ State function doesn't return object!
() => {
  const count = 0;
  const message = 'Hello';
  // Missing return!
}
```

**Solution:**
```javascript
// ✅ Always return object
() => ({
  count: 0,
  message: 'Hello'
})
```

---

### **Pitfall 3: Validation Runs on Every Keystroke**

**Problem:**
```javascript
// ❌ Validates while typing - annoying!
() => ({
  email: '',
  validate: {
    email: (value) => {
      if (!value) return 'Email required';  // Triggers while typing!
      if (!/^[^\s@]+@[^\s@]+/.test(value)) return 'Invalid';
      return true;
    }
  }
})
```

**Solution:**
```javascript
// ✅ Validate manually on submit
() => ({
  email: ''
  // No validate here!
}),

(events, state) => {
  events.on('click', '.submit', () => {
    // Validate manually
    if (!state.email || !/^[^\s@]+@[^\s@]+/.test(state.email)) {
      alert('Invalid email');
      return;
    }
    
    submitForm();
  });
}
```

---

### **Pitfall 4: State Function Not Detected**

**Problem:**
```javascript
// ❌ Has parameters - not detected as state function!
(someParam) => ({
  count: 0
})
```

**Solution:**
```javascript
// ✅ Zero parameters for state function
() => ({
  count: 0
})
```

---

### **Pitfall 5: Async in State Function**

**Problem:**
```javascript
// ❌ Async state function
async () => ({
  data: await fetchData()  // Doesn't work!
})
```

**Solution:**
```javascript
// ✅ Load in effects
() => ({
  data: []  // Start with default
}),

async (state, effects) => {
  effects.once('mounted', async () => {
    const data = await fetchData();
    state.data = data;
  });
}
```

---

## 📚 Complete API Reference

### **ScrollMesh Function**

```javascript
import { ScrollMesh } from 'scrollforge/mesh';

const component = ScrollMesh(...functions);

// Methods
component.mount(selector);
component.unmount();
component.snapshot();
component.restore(snapshot);
component.transaction(fn);
component.undo();
component._render();  // Force re-render
```

### **HTMLScrollMesh Function**

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

const component = HTMLScrollMesh(...functions);

// Same methods as ScrollMesh
component.mount(selector);
component.unmount();
// ... etc
```

### **Reactive Component**

```javascript
const comp = app.Mesh.component(name, config);

// Config options
{
  state: {},              // Initial state
  render: function,       // Render function
  history: boolean,       // Enable undo/redo
  debug: boolean,         // Show debugger
  priority: string,       // 'high', 'normal', 'low'
  query: object,          // Reactive query config
  sync: object            // Smart sync config
}

// Methods
comp.mount(selector);
comp.unmount();
comp.setState(updates);
comp.undo();
comp.redo();
```

### **Blueprints**

```javascript
app.Mesh.blueprint(name, definition);
app.Mesh.create(name, props, children);
app.Mesh.render(component, container);
app.Mesh.update(component, newProps);
app.Mesh.unmount(component);
```

### **Helpers**

```javascript
// Create element helper
app.Mesh.h(tag, props, ...children);

// Repeat (list rendering)
app.Mesh.repeat(items, renderFn);

// Conditional
app.Mesh.when(condition, thenComponent, elseComponent);

// Fragment
app.Mesh.fragment(...children);

// Portal
app.Mesh.portal(component, targetSelector);

// Virtual list
app.Mesh.virtualList(container, items, renderItem, options);
```

---

## 🎓 Best Practices

### **1. Separate Concerns**

```javascript
// ✅ GOOD - Each function has one job
HTMLScrollMesh(
  uiFunction,       // Only UI
  weaveFunction,    // Only styling
  logicFunction,    // Only events
  effectsFunction,  // Only side effects
  stateFunction     // Only state
);

// ❌ BAD - Everything mixed
HTMLScrollMesh(
  (state, weave, events, effects) => {
    // UI + styling + logic + effects all mixed
    // Hard to maintain!
  }
);
```

### **2. Use Computed Properties**

```javascript
// ✅ GOOD
computed: {
  fullName: (state) => `${state.firstName} ${state.lastName}`
}

// ❌ BAD - Compute in UI every render
({ firstName, lastName }) => {
  const fullName = `${firstName} ${lastName}`;  // Every render!
  return `<div>${fullName}</div>`;
}
```

### **3. Uncontrolled Inputs for Text**

```javascript
// ✅ GOOD - Uncontrolled
() => `<input class="search">`,

(events, state) => {
  events.on('keydown', '.search', (e) => {
    if (e.key === 'Enter') {
      state.query = e.target.value;
    }
  });
}

// ❌ BAD - Controlled (causes refresh)
({ query }) => `<input value="${query}">`,

(events, state) => {
  events.on('input', 'input', (e) => {
    state.query = e.target.value;  // Re-render every keystroke!
  });
}
```

### **4. Load Data Synchronously**

```javascript
// ✅ GOOD - Sync load in state
() => ({
  todos: JSON.parse(localStorage.getItem('todos') || '[]')
})

// ❌ BAD - Async load
async () => ({
  todos: await loadTodos()  // Doesn't work!
})
```

### **5. Memoize Expensive Selectors**

```javascript
// ✅ GOOD - Memoized
selectors: {
  sortedUsers: (state) => 
    [...state.users].sort((a, b) => a.name.localeCompare(b.name))
}

// ❌ BAD - Sorts every render
({ users }) => {
  const sorted = [...users].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  return `<div>${sorted.length}</div>`;
}
```

---

## 🎯 Summary - The Golden Rules

### **1. Context Auto-Wiring**
- ✅ Framework detects function signatures
- ✅ Unlimited functions can be passed
- ✅ Each function gets what it needs automatically
- ✅ NO manual configuration required

### **2. State Function Rules**
- ✅ Must have ZERO parameters
- ✅ Must return an object
- ✅ Can have computed, selectors, middleware, validate
- ✅ Load data synchronously (localStorage, etc.)

### **3. Input Handling**
- ✅ Use uncontrolled inputs for text fields
- ✅ Don't bind `value="${stateValue}"`
- ✅ Get value from DOM when needed
- ✅ Only update state on submit/blur

### **4. Performance**
- ✅ Use selectors for memoization
- ✅ Use computed properties for derived data
- ✅ Debounce expensive effects
- ✅ Use virtual lists for large datasets

### **5. Separation of Concerns**
- ✅ One function = one responsibility
- ✅ UI function = templates only
- ✅ Logic function = events only
- ✅ Effects function = side effects only
- ✅ Keep them separate for maintainability

---

🔥 **ScrollMesh - Recursive Component Assembly** 🔥

**Built on Organized Chaos Pattern**
**Unlimited Functions Auto-Wire**
**Messy Backend, Clean Frontend** ✨

---

**Every pattern, every context, every detail explained!**

**Master ScrollMesh = Master Component Assembly** 🚀

