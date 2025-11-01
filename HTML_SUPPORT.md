# 🔥 ScrollForge HTML Template Support

## ✨ **Full Flexibility - Choose Your Style!**

ScrollMesh now supports **THREE modes** - use whichever fits your needs!

---

## 🎯 **MODE 1: HTML Template Strings**

### **Best for:** Familiar HTML syntax, easy to write

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

const App = HTMLScrollMesh(
  // Function 1: HTML Template
  ({ count, user }) => `
    <div class="app">
      <h1>Hello ${user.name}!</h1>
      <p class="count">Count: ${count}</p>
      <button class="increment-btn">Increment</button>
    </div>
  `,
  
  // Function 2: ScrollWeave Styling
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

**Features:**
- ✅ Write HTML directly
- ✅ Template interpolation `${state.value}`
- ✅ Auto-updates when state changes
- ✅ ScrollWeave dynamic styling
- ✅ Event binding to logic

---

## 🎯 **MODE 2: JavaScript Objects**

### **Best for:** Type safety, IDE autocomplete

```javascript
import { ScrollMesh } from 'scrollforge/mesh';

const App = ScrollMesh(
  // Function 1: JavaScript Objects
  ({ count, user }) => ({
    tag: 'div',
    attrs: { class: 'app' },
    children: [
      {
        tag: 'h1',
        content: `Hello ${user.name}!`
      },
      {
        tag: 'p',
        attrs: { class: 'count' },
        content: `Count: ${count}`
      },
      {
        tag: 'button',
        attrs: { class: 'increment-btn' },
        content: 'Increment'
      }
    ]
  }),
  
  // Function 2: ScrollWeave
  (state, weave) => {
    weave.when('.count',
      state.count > 5,
      { color: 'green' },
      { color: 'blue' }
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

**Features:**
- ✅ Full control over structure
- ✅ Type-safe (if using TypeScript)
- ✅ IDE autocomplete
- ✅ Same auto-update and styling

---

## 🎯 **MODE 3: Mixed (Best of Both Worlds)**

### **Best for:** Flexibility - use HTML or JS per component

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

const App = HTMLScrollMesh(
  // Can switch between HTML and JS dynamically!
  ({ count, useHTML }) => {
    if (useHTML) {
      // Return HTML string
      return `
        <div>
          <p>HTML Mode: ${count}</p>
          <button class="toggle">Switch to JS</button>
        </div>
      `;
    } else {
      // Return JS object
      return {
        tag: 'div',
        children: [
          {
            tag: 'p',
            content: `JS Mode: ${count}`
          },
          {
            tag: 'button',
            attrs: { class: 'toggle' },
            content: 'Switch to HTML'
          }
        ]
      };
    }
  },
  
  (events, state) => {
    events.on('click', '.toggle', () => {
      state.useHTML = !state.useHTML;
      state.count++;
    });
  },
  
  () => ({
    count: 0,
    useHTML: true
  })
);

App.mount('#app');
```

---

## 🔥 **COMPLETE INTEGRATION EXAMPLE:**

### **HTML + ScrollMesh + ScrollWeave + ScrollScript**

```javascript
import ScrollForge from 'scrollforge';
import { HTMLScrollMesh } from 'scrollforge/mesh';

window.app = new ScrollForge();

// Create global signals (ScrollScript)
app.Script.signal('theme', 'light');
app.Script.signal('user', { name: 'John', status: 'active' });

// Build component with HTML
const Dashboard = HTMLScrollMesh(
  // HTML Template
  ({ count, theme, user }) => `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Dashboard - ${user.name}</h1>
        <span class="theme-indicator">${theme} mode</span>
      </header>
      
      <main class="dashboard-content">
        <div class="stat-box">
          <h2>Total Count</h2>
          <div class="stat-value">${count}</div>
        </div>
        
        <div class="controls">
          <button class="increment">+1</button>
          <button class="decrement">-1</button>
          <button class="toggle-theme">Toggle Theme</button>
        </div>
      </main>
    </div>
  `,
  
  // ScrollWeave - Dynamic Styling
  (state, weave) => {
    // Theme-based styling
    if (state.theme === 'dark') {
      weave.apply('.dashboard', {
        background: '#1a1a1a',
        color: '#fff'
      });
      
      weave.apply('.stat-box', {
        background: '#2a2a2a',
        border: '1px solid #444'
      });
    } else {
      weave.apply('.dashboard', {
        background: '#ffffff',
        color: '#333'
      });
      
      weave.apply('.stat-box', {
        background: '#f5f5f5',
        border: '1px solid #ddd'
      });
    }
    
    // Count-based styling
    weave.when('.stat-value',
      state.count > 10,
      { color: 'green', fontSize: '3rem' },
      { color: '#667eea', fontSize: '2rem' }
    );
    
    // Hover animations
    weave.on('.increment', 'mouseenter', {
      transform: 'scale(1.1)'
    });
    
    weave.on('.increment', 'mouseleave', {
      transform: 'scale(1)'
    });
  },
  
  // Logic (Event Handlers)
  (events, state) => {
    events.on('click', '.increment', () => {
      state.count++;
    });
    
    events.on('click', '.decrement', () => {
      state.count--;
    });
    
    events.on('click', '.toggle-theme', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      
      // Also update global signal
      app.Script.set('theme', state.theme);
    });
  },
  
  // State (with sync to global signals)
  () => ({
    count: 0,
    theme: app.Script.get('theme'),
    user: app.Script.get('user')
  }),
  
  // Side Effects
  (state, effects) => {
    effects.when('count', (count) => {
      console.log('Count changed to:', count);
      
      if (count > 20) {
        console.log('Wow, you clicked a lot!');
      }
    });
  }
);

Dashboard.mount('#app');

// Apply base styles with ScrollWeave
setTimeout(() => {
  app.Weave.apply('.dashboard', {
    padding: '2rem',
    borderRadius: '10px',
    transition: 'all 0.3s ease'
  });
  
  app.Weave.apply('.stat-box', {
    padding: '1.5rem',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '1rem'
  });
  
  app.Weave.apply('button', {
    padding: '0.75rem 1.5rem',
    margin: '0.5rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600',
    background: '#667eea',
    color: 'white',
    transition: 'all 0.3s ease'
  });
}, 100);
```

---

## 🎯 **THE CONNECTION FLOW:**

```
HTML in Function 1
      ↓
   (renders)
      ↓
   DOM Elements
      ↓
      ├─→ ScrollWeave (Function 2) - Applies dynamic styles
      │
      └─→ ScrollScript (Function 3) - Binds events
            ↓
         Updates State (Function 4)
            ↓
      Auto-re-renders HTML
            ↓
      ScrollWeave updates styles again
            ↓
         Smooth animations!
```

---

## ✨ **FLEXIBILITY OPTIONS:**

### **You can use:**

1. ✅ **Pure HTML** - `HTMLScrollMesh` with template strings
2. ✅ **Pure JS** - `ScrollMesh` with objects
3. ✅ **Mixed** - Switch between HTML/JS dynamically
4. ✅ **With Weave** - Add `weave` function for styling
5. ✅ **Without Weave** - Just HTML + logic
6. ✅ **Any combination** - Total flexibility!

---

## 🚀 **Try the Examples:**

```bash
cd examples/html-template-demo

# Basic example
open index.html

# Advanced examples (all modes)
open advanced.html
```

---

🔥 **ScrollMesh is now FULLY FLEXIBLE!** 🔥

- Write HTML ✅
- Write JS objects ✅
- Mix both ✅
- Add ScrollWeave ✅
- Auto-wiring ✅
- Unlimited functions ✅

**Choose your style!** 💎

