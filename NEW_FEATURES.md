

# 🔥 ScrollForge v0.2.0 - NEW FEATURES

## 🚀 **What's New:**

---

## 1️⃣ **ScrollMesh Context - Auto-Wiring System**

### **The Problem:**
Traditional frameworks require manual wiring between UI, logic, and state.

### **The Solution:**
Pass unlimited functions to `ScrollMesh()` - they auto-connect!

```javascript
import { ScrollMesh } from 'scrollforge/mesh';

const MyApp = ScrollMesh(
  // Function 1: UI (auto-subscribes to state)
  ({ count, user }) => ({
    tag: 'div',
    children: [
      { tag: 'h1', content: `Count: ${count}` },
      { tag: 'p', content: user.name }
    ]
  }),
  
  // Function 2: Logic (auto-connects to events)
  (events, state) => {
    events.on('increment', () => {
      state.count++;
    });
  },
  
  // Function 3: State (auto-provides to UI)
  () => ({
    count: 0,
    user: { name: 'John' }
  }),
  
  // Function 4: Side Effects
  (state, effects) => {
    effects.when('count', (count) => {
      console.log('Count changed:', count);
    });
  },
  
  // Function 5: Animations
  (state, animate) => {
    animate.when('count', () => {
      animate.spring('.counter', { scale: 1.2 });
    });
  }
  
  // ... ADD AS MANY FUNCTIONS AS YOU WANT!
);

// Mount and forget - everything auto-wires!
MyApp.mount('#app');
```

### **Available Contexts:**
- `state` - Reactive state (read/write)
- `events` - Event system (on/emit/off)
- `effects` - Side effects (when/once)
- `animate` - Animations (when/spring)
- `api` - API calls (when/fetch)
- `storage` - Persistence (persist/load)
- `validate` - Validation (rule)
- `analytics` - Analytics (track)

---

## 2️⃣ **Reactive Components - Auto-Rendering**

### **No More Manual watch() Calls!**

```javascript
const Counter = app.Mesh.component('Counter', {
  state: {
    count: 0
  },
  
  render({ count }) {
    return {
      tag: 'button',
      content: `Count: ${count}`,
      events: {
        click: () => {
          this.state.count++; // Auto-re-renders!
        }
      }
    };
  }
});

Counter.mount('#app');
// That's it! No watch(), no manual render()
```

---

## 3️⃣ **Computed State - Auto-Updating Derived Values**

```javascript
ScrollMesh(
  ({ fullName, age }) => ({
    tag: 'div',
    content: `${fullName} is ${age} years old`
  }),
  
  () => ({
    firstName: 'John',
    lastName: 'Doe',
    birthYear: 1990,
    
    // Computed properties - auto-update!
    computed: {
      fullName: (state) => `${state.firstName} ${state.lastName}`,
      age: (state) => new Date().getFullYear() - state.birthYear
    }
  })
);
```

---

## 4️⃣ **State Selectors - Memoized Queries**

```javascript
ScrollMesh(
  ({ activeUsers, premiumUsers }) => ({
    tag: 'div',
    content: `Active: ${activeUsers.length}, Premium: ${premiumUsers.length}`
  }),
  
  () => ({
    users: [...],
    
    // Selectors - only recompute when needed
    selectors: {
      activeUsers: (state) => state.users.filter(u => u.active),
      premiumUsers: (state) => state.users.filter(u => u.premium)
    }
  })
);
```

---

## 5️⃣ **Time-Travel - Built-in Undo/Redo**

```javascript
const Editor = app.Mesh.component('Editor', {
  state: { text: '' },
  
  history: true, // Enable time-travel!
  
  render({ text }) {
    return {
      tag: 'div',
      children: [
        { tag: 'textarea', value: text },
        { tag: 'button', content: 'Undo', events: {
          click: () => this.undo()
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

## 6️⃣ **State Transactions - Atomic Updates**

```javascript
ScrollMesh(
  (events, state) => {
    events.on('transfer', () => {
      // All or nothing - rollback on error
      state.transaction(() => {
        state.accountA -= 100;
        state.accountB += 100;
        state.log.push({ from: 'A', to: 'B' });
      });
    });
  }
);
```

---

## 7️⃣ **State Middleware - Intercept Changes**

```javascript
ScrollMesh(
  () => ({
    count: 0,
    
    // Middleware runs before state changes
    middleware: {
      count: (oldValue, newValue) => {
        console.log(`Count: ${oldValue} -> ${newValue}`);
        // Can modify or reject
        return newValue < 0 ? 0 : newValue;
      }
    }
  })
);
```

---

## 8️⃣ **State Validation - Runtime Checks**

```javascript
ScrollMesh(
  () => ({
    email: '',
    age: 0,
    
    // Validation rules
    validate: {
      email: (value) => /\S+@\S+\.\S+/.test(value) || 'Invalid email',
      age: (value) => value >= 18 || 'Must be 18+'
    }
  })
);

// Auto-validates on change!
```

---

## 9️⃣ **State Immutability - Prevent Mutations**

```javascript
ScrollMesh(
  () => ({
    user: { name: 'John' },
    
    immutable: true // Prevent direct mutations
  })
);

// This throws error:
state.user.name = 'Jane'; // ❌

// Must do:
state.user = { ...state.user, name: 'Jane' }; // ✅
```

---

## 🔟 **Visual Debugging - See Your State**

```javascript
const Counter = app.Mesh.component('Counter', {
  state: { count: 0 },
  
  debug: true, // Shows live debug panel!
  
  render({ count }) {
    return { tag: 'button', content: count };
  }
});

// Debug panel shows:
// - Current state
// - Dependencies
// - History
// - Performance
```

---

## 1️⃣1️⃣ **Reactive Queries - Database-Like State**

```javascript
const UserList = app.Mesh.component('UserList', {
  // Query-like state management
  query: {
    from: 'users',
    where: user => user.active,
    orderBy: 'name',
    limit: 10
  },
  
  render({ results }) {
    return results.map(user => ({
      tag: 'div',
      content: user.name
    }));
  }
});
```

---

## 1️⃣2️⃣ **Smart Sync - Bi-Directional Binding**

```javascript
const Form = app.Mesh.component('Form', {
  // Two-way binding with global signals
  sync: {
    email: 'user.email',
    password: 'user.password'
  },
  
  render({ email, password }) {
    return {
      tag: 'form',
      children: [
        { tag: 'input', bind: 'email' },
        { tag: 'input', bind: 'password', type: 'password' }
      ]
    };
  }
});
```

---

## 📊 **Comparison:**

### **React:**
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Count changed');
  }, [count]);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

### **ScrollForge:**
```javascript
ScrollMesh(
  ({ count }) => ({
    tag: 'button',
    content: count,
    events: { click: () => state.count++ }
  }),
  
  (state, effects) => {
    effects.when('count', () => console.log('Count changed'));
  },
  
  () => ({ count: 0 })
);
```

---

## 🎯 **Benefits:**

1. ✅ **Less Boilerplate** - No hooks, no manual wiring
2. ✅ **Better Organization** - Everything in one place
3. ✅ **Auto-Optimization** - Framework handles reactivity
4. ✅ **Time-Travel** - Built-in undo/redo
5. ✅ **Type Safety** - Runtime validation
6. ✅ **Visual Debugging** - See state in real-time
7. ✅ **Unlimited Functions** - Add as many as needed
8. ✅ **Auto-Wiring** - Functions connect automatically

---

## 1️⃣3️⃣ **Time-Slicing - Smooth 60fps Always**

```javascript
const HugeList = app.Mesh.component('HugeList', {
  state: { items: [] },
  
  priority: 'low', // Render in idle time
  
  render({ items }) {
    return {
      tag: 'div',
      children: items.map(item => ({
        tag: 'div',
        content: item
      }))
    };
  }
});

// Renders 10,000 items without janking!
```

### **Priority Levels:**
- `high` - Interactive elements (buttons, inputs)
- `normal` - Regular content (default)
- `low` - Background content (large lists)

---

## 1️⃣4️⃣ **Visual Debugger - See Your Data Flow**

```javascript
// Enable debugger globally
app.Mesh.enableDebugger();

// Or per component
const Counter = app.Mesh.component('Counter', {
  state: { count: 0 },
  debug: true, // Auto-registers with debugger
  
  render({ count }) {
    return { tag: 'button', content: count };
  }
});

// Press Ctrl+Shift+D to toggle debugger panel!
```

### **Debugger Shows:**
- 📊 All components and their state
- 🎯 Dependencies for each component
- ⏱️ Render times and performance
- 📈 FPS and memory usage
- 🔄 Render count per component

---

---

## 1️⃣5️⃣ **HTML Template Support - Write HTML Directly!**

### **NEW: Choose Your Style - HTML or JavaScript**

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

// Mode 1: HTML Template Strings
const App = HTMLScrollMesh(
  // Function 1: HTML Template
  ({ count, user }) => `
    <div class="app">
      <h1>Hello ${user.name}!</h1>
      <p class="count">Count: ${count}</p>
      <button class="increment-btn">Increment</button>
    </div>
  `,
  
  // Function 2: ScrollWeave Dynamic Styling
  (state, weave) => {
    weave.when('.count',
      state.count > 5,
      { color: 'green', fontSize: '2rem' },
      { color: 'blue', fontSize: '1rem' }
    );
  },
  
  // Function 3: Logic
  (events, state) => {
    events.on('click', '.increment-btn', () => {
      state.count++;
    });
  },
  
  // Function 4: State
  () => ({
    count: 0,
    user: { name: 'John' }
  })
);

App.mount('#app');
```

### **Flexibility - All Modes Work:**

**Pure HTML:**
```javascript
HTMLScrollMesh(
  ({ count }) => `<button>${count}</button>`,
  // ... logic & state
);
```

**Pure JavaScript:**
```javascript
ScrollMesh(
  ({ count }) => ({ tag: 'button', content: count }),
  // ... logic & state
);
```

**Mixed (Switch Dynamically):**
```javascript
HTMLScrollMesh(
  ({ count, mode }) => {
    if (mode === 'html') {
      return `<div>${count}</div>`;
    } else {
      return { tag: 'div', content: count };
    }
  },
  // ... logic & state
);
```

### **Features:**
- ✅ Template interpolation `${state.value}`
- ✅ Auto-updates when state changes
- ✅ Event binding from HTML
- ✅ ScrollWeave integration
- ✅ Full flexibility (HTML or JS)
- ✅ Can switch modes dynamically

---

## 🚀 **Try It Now:**

```bash
# Reactive components demo
cd examples/reactive-demo
open index.html

# HTML template demo
cd examples/html-template-demo
open index.html        # Basic example
open advanced.html     # All modes

# Press Ctrl+Shift+D to toggle debugger
```

---

## 📚 **Full API:**

See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for complete API documentation.
See [HTML_SUPPORT.md](./HTML_SUPPORT.md) for HTML template guide.

---

🔥 **ScrollForge v0.2.0 - The Future of Web Development!** 🔥

