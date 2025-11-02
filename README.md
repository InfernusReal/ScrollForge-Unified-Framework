# 🔥 ScrollForge

**The Unified Reactive Framework**

[![npm version](https://badge.fury.io/js/scrollforge.svg)](https://www.npmjs.com/package/scrollforge)
[![Downloads](https://img.shields.io/npm/dm/scrollforge.svg)](https://www.npmjs.com/package/scrollforge)
[![GitHub](https://img.shields.io/github/stars/InfernusReal/ScrollForge-Unified-Framework?style=social)](https://github.com/InfernusReal/ScrollForge-Unified-Framework)

> "Behavior is structure. Structure is style. Style is logic."

🌐 **[www.infernusreal.com](https://www.infernusreal.com)** - Portfolio & Contact

ScrollForge is a revolutionary full-stack framework that unifies three powerful engines into one coherent system:

- **⚡ ScrollScript** - Universal data flow orchestration (client + server)
- **🎨 ScrollWeave** - Logic-reactive styling engine
- **🏗️ ScrollMesh** - Recursive component assembly

---

## ✨ Features

### 🚀 **Universal Data Flow (ScrollScript)**
- Shared Variables Theory - connect everything through signals
- Single dispatcher for all actions (client & server)
- Time-travel debugging built-in (global + per-component)
- Deterministic state management
- Derived signals and selectors
- LocalStorage persistence and cross-tab sync

### 🎨 **Logic-Reactive Styling (ScrollWeave)**
- CSS becomes runtime-controlled
- Conditional styling with if/else logic
- Built-in animations and transitions
- Spring physics and GPU-accelerated effects
- Design tokens and theme system
- Responsive helpers

### 🏗️ **Component Assembly (ScrollMesh)**
- **3 Rendering Modes:** HTML templates, JavaScript objects, or Mixed
- Auto-wiring unlimited functions through context
- Reactive components (auto-subscribe, auto-render)
- Computed properties and memoized selectors
- Component-level time-travel (undo/redo)
- Time-slicing for 60fps performance
- Priority system (high/normal/low)
- Visual debugger (Ctrl+Shift+D)

### 🔗 **Advanced Features**
- Reactive queries (database-like state)
- Smart sync (bi-directional binding)
- State transactions (atomic updates)
- State middleware and validation
- Deep reactivity for nested objects
- Immutability options

### 🏢 **Enterprise Scale (v0.4.0 - NEW!)**
- **Static Analyzer** - Dependency graphs, dead code detection, optimization hints
- **Code Splitting** - Lazy loading per component, chunk management
- **Copy-On-Write** - Memory-efficient snapshots for massive state
- **Scene Manager** - Multi-scene apps for team collaboration
- **Advanced Virtualization** - Lists, trees, grids for millions of items
- **Web Worker Pool** - Offload heavy tasks to background threads
- **4-Lane Scheduler** - Priority system (input > animation > network > idle)
- **Object Pooling** - Reuse DOM elements, minimize garbage collection
- **Graph Visualizer** - Interactive visual dependency graph
- **Module System** - Lean core + on-demand feature modules
- **Advanced CLI** - Code generation, analysis, optimization
- **Handles 10,000+ components** while maintaining 60fps

### 🌐 **Full-Stack Ready**
- Same API for client and server
- **Composable routers** with nested routing and wildcards
- **Middleware lanes** (before/after hooks, error boundaries)
- **WebSocket channels** with broadcast, presence tracking, message replay
- **Action pipelines** (guard → transform → commit → effect)
- **ForgeFetch** - Advanced HTTP client (retry, backoff, caching, optimistic updates)
- **Net Hub** - Network state monitoring and live queries
- **Collaboration loop** - Real-time sync across all clients
- **Dev tools** - Hot reload, request tracing, test helpers

---

## 📦 Installation

```bash
npm install scrollforge
```

Or use the CLI to create a new project:

```bash
npx scrollforge create my-app
cd my-app
npm install
npm run dev
```

---

## 🎯 Quick Start

### **NEW in v0.2.0:** Choose Your Style!

#### **Option 1: HTML Template Mode** (Easiest!)

```javascript
import { HTMLScrollMesh } from 'scrollforge/mesh';

const Counter = HTMLScrollMesh(
  // HTML Template - familiar syntax!
  ({ count }) => `
    <div style="text-align: center;">
      <h1>Count: ${count}</h1>
      <button class="increment-btn">Increment</button>
    </div>
  `,
  
  // ScrollWeave - dynamic styling
  (state, weave) => {
    weave.when('h1',
      state.count > 5,
      { color: 'green' },
      { color: 'blue' }
    );
  },
  
  // Logic - event handlers
  (events, state) => {
    events.on('click', '.increment-btn', () => {
      state.count++;
    });
  },
  
  // State
  () => ({ count: 0 })
);

Counter.mount('#app');
// That's it! Auto-renders, auto-updates!
```

#### **Option 2: JavaScript Object Mode** (Type-safe!)

```javascript
import { ScrollMesh } from 'scrollforge/mesh';

const Counter = ScrollMesh(
  // JavaScript Objects
  ({ count }) => ({
    tag: 'div',
    style: { textAlign: 'center' },
    children: [
      { tag: 'h1', content: `Count: ${count}` },
      { tag: 'button', attrs: { class: 'increment-btn' }, content: 'Increment' }
    ]
  }),
  
  // ScrollWeave
  (state, weave) => {
    weave.when('h1',
      state.count > 5,
      { color: 'green' },
      { color: 'blue' }
    );
  },
  
  // Logic
  (events, state) => {
    events.on('click', '.increment-btn', () => state.count++);
  },
  
  // State
  () => ({ count: 0 })
);

Counter.mount('#app');
```

#### **Option 3: Reactive Component Mode** (Simplest!)

```javascript
import ScrollForge from 'scrollforge';

const app = new ScrollForge();

const Counter = app.Mesh.component('Counter', {
  state: { count: 0 },
  
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
// No watch(), no manual render() - everything automatic!
```

---

## 📚 Core Concepts

### ⚡ ScrollScript - Universal Data Flow

Based on **Shared Variables Theory**: Connect functions, loops, and conditionals using shared global state.

```javascript
// Create signals (reactive values)
app.Script.signal('user', null);
app.Script.signal('isLoggedIn', false);

// Derived signals (computed values)
app.Script.derived('userName', () => {
  const user = app.Script.get('user');
  return user?.name || 'Guest';
}, ['user']);

// Actions (state mutations)
app.Script.action('LOGIN', (payload) => {
  app.Script.set('user', payload.user);
  app.Script.set('isLoggedIn', true);
});

// Trigger actions
app.Script.trigger('LOGIN', { user: { name: 'John' } });

// Watch for changes
app.Script.watch('isLoggedIn', (value) => {
  console.log('Login status:', value);
});
```

#### Event Bindings

```javascript
// Keyboard
app.Script.onKey('Enter', 'SUBMIT_FORM');
app.Script.onKey('Escape', 'CLOSE_MODAL');

// Mouse/Touch
app.Script.onClick('#button', 'BUTTON_CLICKED');
app.Script.onPointer('MOUSE_MOVED');

// Scroll
app.Script.onScroll('SCROLL_UPDATED', 100); // throttled

// Form
app.Script.onSubmit('#form', 'FORM_SUBMITTED');
app.Script.onInput('#input', 'INPUT_CHANGED');
```

#### Time-Travel

```javascript
// Undo last action
app.Script.undo();

// Jump to specific point in time
app.Script.jumpTo(epochNumber);

// Get history
const history = app.Script.getHistory();
```

---

### 🎨 ScrollWeave - Logic-Reactive Styling

**"Style is not separate from behavior"** - CSS becomes runtime-controlled based on state.

```javascript
// Apply styles directly
app.Weave.apply('.button', {
  background: 'blue',
  padding: '10px 20px',
  borderRadius: '5px',
});

// Conditional styling (if-then-else)
app.Weave.when(
  '.button',
  isActive, // condition
  { background: 'green', transform: 'scale(1.1)' }, // then
  { background: 'gray', transform: 'scale(1)' } // else
);

// Multiple conditions (switch-like)
app.Weave.switch('.status', [
  {
    condition: status === 'success',
    styles: { color: 'green', fontWeight: 'bold' },
  },
  {
    condition: status === 'error',
    styles: { color: 'red', fontWeight: 'bold' },
  },
], { color: 'black' }); // default

// Animations
app.Weave.fadeIn('.modal', 300);
app.Weave.fadeOut('.modal', 300);
app.Weave.slideIn('.sidebar', 'left', 400);

// Spring physics
app.Weave.spring('.card', {
  transform: 'translateY(0)',
  opacity: 1,
}, {
  stiffness: 200,
  damping: 20,
});

// Custom animations
app.Weave.animate('.element', [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' },
], {
  duration: 1000,
  easing: 'ease-in-out',
  iterations: Infinity,
});
```

#### Design Tokens

```javascript
// Define tokens
app.Weave.token('primary', '#667eea');
app.Weave.token('secondary', '#764ba2');

// Use tokens
app.Weave.apply('.button', {
  background: app.Weave.getToken('primary'),
});

// Themes
app.Weave.theme('dark', {
  background: '#000',
  text: '#fff',
  primary: '#667eea',
});

app.Weave.applyTheme('dark');
```

---

### 🏗️ ScrollMesh - Recursive Component Assembly

**"Messy backend, clean frontend"** - Chaos lives inside, clean facade outside.

```javascript
// Define blueprints (component definitions)
app.Mesh.blueprint('Button', (props) => ({
  tag: 'button',
  attrs: { class: 'btn' },
  content: props.label,
  events: {
    click: props.onClick,
  },
}));

// Nested components
app.Mesh.blueprint('Card', (props, children) => ({
  tag: 'div',
  attrs: { class: 'card' },
  children: [
    { tag: 'h2', content: props.title },
    { tag: 'p', content: props.description },
    ...children, // Slot for children
  ],
}));

// Create instances
const button = app.Mesh.create('Button', {
  label: 'Click me',
  onClick: () => console.log('Clicked!'),
});

// Render to DOM
app.Mesh.render(button, '#app');

// Update component
app.Mesh.update(button, { label: 'Updated!' });

// Unmount
app.Mesh.unmount(button);
```

#### Connectors (The Messy Backend Pattern)

```javascript
// messybackend.js - Complex nested logic
function createHeader(context) {
  return {
    tag: 'header',
    children: [
      createLogo(context),
      createNav(context),
      createUserMenu(context),
    ],
  };
}

function createBody(context) {
  return {
    tag: 'main',
    children: context.sections.map(createSection),
  };
}

// connector.js - Clean orchestrator
app.Mesh.connector('App', (context, mesh) => ({
  tag: 'div',
  attrs: { class: 'app' },
  children: [
    createHeader(context),
    createBody(context),
    createFooter(context),
  ],
}));

// Usage
const app = app.Mesh.assemble('App', {
  user: currentUser,
  sections: dataSections,
});
```

#### Helpers

```javascript
// Repeat (list rendering)
const items = app.Mesh.repeat(data, (item, index) =>
  app.Mesh.create('ListItem', { item, index })
);

// Conditional rendering
const content = app.Mesh.when(
  isLoggedIn,
  app.Mesh.create('Dashboard'),
  app.Mesh.create('Login')
);

// Fragment (multiple roots)
const elements = app.Mesh.fragment(
  app.Mesh.create('Header'),
  app.Mesh.create('Body'),
  app.Mesh.create('Footer')
);

// Virtual list (for large datasets)
app.Mesh.virtualList('#container', largeArray, (item) =>
  app.Mesh.create('ListItem', { item })
, { itemHeight: 50 });
```

---

## 🌐 Full-Stack Usage

### Server-Side (Node.js)

```javascript
import { ScrollScriptServer } from 'scrollforge/script';

const server = new ScrollScriptServer();

// Signals work on server too
server.signal('users', []);
server.signal('activeConnections', 0);

// HTTP Routes
server.get('/api/users', 'FETCH_USERS');

server.action('FETCH_USERS', ({ req, res }) => {
  const users = server.get('users');
  server.json(res, { users });
});

// Auto-sync signals to clients
server.autoSync('users');

// Start server
server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Client-Server Integration

```javascript
// Server
server.signal('counter', 0);
server.autoSync('counter'); // Broadcasts changes to all clients

server.post('/increment', 'INCREMENT');
server.action('INCREMENT', () => {
  const counter = server.get('counter');
  server.set('counter', counter + 1);
  // All connected clients automatically receive update
});

// Client
app.Script.signal('counter', 0);

// Listen for server updates
// Note: WebSocket client integration requires manual setup
app.Script.watch('counter', (value) => {
  console.log('Counter updated from server:', value);
});
```

---

## 🛠️ CLI Tools

```bash
# Create new project
sf create my-app
sf create my-app --template counter
sf create my-app --template scroll

# Development server
sf dev
sf dev --port 8080
sf dev --open

# Build for production
sf build
sf build --output dist
sf build --minify

# Generate code (NEW in v0.4.0!)
sf generate component UserList
sf generate route getUsers
sf generate action FETCH_USERS
sf generate test userTests

# Analyze project (NEW in v0.4.0!)
sf analyze
sf analyze --find-cycles
```

---

## 📖 Examples

Check out the `/examples` directory:

- **counter/** - Basic reactive counter with all three engines
- **scroll-navigator/** - Scroll-driven section navigation with animations
- **todo-mvc/** - Classic TodoMVC with persistence and filtering
- **reactive-demo/** - Advanced features (context, time-travel, computed state)
- **html-template-demo/** - HTML template mode with all rendering styles
- **ultimate-fullstack/** - Complete full-stack with real-time collaboration

### **Try Them:**

```bash
cd examples/counter
# Open index.html in browser

cd examples/html-template-demo
open advanced.html  # See all 3 rendering modes!

cd examples/ultimate-fullstack
node server.js     # Start backend
open client.html   # Open frontend - see real-time magic!
```

---

## 🎯 Philosophy - Causal Graph Programming

> **"Programs are causal graphs. Events cause state. State causes effects. The framework manages the graph."**

ScrollForge is built on a new paradigm: **Causal Graph Programming (CGP)**

### **Core Principles:**

1. **Unified Causality** - Events cause state changes, state changes cause visual updates. Everything is connected through one explicit causal graph.

2. **Shared Variables Theory** - Global state connects all functions. Single dispatcher routes all actions. This is the apex manager pattern - the foundation of CGP.

3. **Organized Chaos** - Messy implementation details live in the backend. Clean facades are exposed to the frontend. Unlimited functions auto-wire through context.

4. **Explicit Graph Structure** - The causal graph is visible, analyzable, and optimizable. Dependency graphs show what causes what. Visual tools make causality transparent.

### **Why CGP is Different:**

**OOP:** Programs are objects calling methods  
**FP:** Programs are function compositions  
**Reactive:** Programs are data stream transformations  
**CGP:** **Programs are causal graphs with auto-managed propagation** ✨

ScrollForge is the **first implementation** of Causal Graph Programming.

---

## 🚀 Performance

- **Batched Updates** - Multiple signal changes batched into single render
- **Dirty Tracking** - Only changed signals trigger updates
- **GPU Acceleration** - Animations use transform/opacity when possible
- **Virtual Lists/Trees/Grids** - Millions of items rendered smoothly
- **Memoization** - Derived signals and selectors cached until dependencies change
- **Time-Slicing** - Renders spread across frames to maintain 60fps
- **4-Lane Priority System** - input > animation > network > idle
- **Micro-Chunking** - Long tasks split across frames (never block > 16ms)
- **Object Pooling** - Reuse DOM elements, minimize garbage collection
- **Web Worker Pool** - Heavy computations off main thread
- **Code Splitting** - Lazy load components on demand
- **Auto-Optimization** - Static analyzer suggests improvements
- **Handles 10,000+ components** while maintaining 60fps

---

## 🧪 Testing

```javascript
// Test action sequences
app.Script.trigger('ACTION_1');
app.Script.trigger('ACTION_2');

// Assert state
assert(app.Script.get('value') === expected);

// Time-travel for testing
app.Script.jumpTo(previousEpoch);
```

---

## 📄 License

MIT © IA-Labs | Inherited Alteration Systems

---

## 🔗 Links

### **Getting Started:**
- [Getting Started](./GETTING_STARTED.md) - Beginner tutorial
- [Complete Guide](./COMPLETE_GUIDE.md) - **3,500+ line complete tutorial**
- [Quick Reference](./QUICK_REFERENCE.md) - One-page cheat sheet
- [Code Snippets](./CODE_SNIPPETS.md) - **25 copy-paste examples**

### **Advanced Guides:**
- [New Features (v0.2.0)](./NEW_FEATURES.md) - Context, Reactive, HTML
- [Ultimate Features (v0.3.0)](./ULTIMATE_FEATURES.md) - Backend/Frontend power
- [Scaling Features (v0.4.0)](./SCALING_COMPLETE.md) - **Enterprise scale**
- [HTML Template Guide](./HTML_SUPPORT.md) - HTML integration
- [Full-Stack Magic](./FULLSTACK_MAGIC.md) - Complete flow
- [Scaling Roadmap](./SCALING_ROADMAP.md) - Future vision

### **Project Info:**
- [Examples](./examples) - 6 working demos
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines
- [Changelog](./CHANGELOG.md) - Version history
- [License](./LICENSE) - MIT

---

## ⌨️ Keyboard Shortcuts

- **Ctrl+Shift+D** - Toggle visual debugger
- **Arrow Keys** - Work in scroll navigator example
- **Ctrl+Z** - Undo (in components with `history: true`)

---

## 🎓 Learning Path

1. **Start:** [GETTING_STARTED.md](./GETTING_STARTED.md)
2. **Try:** `examples/counter` - Basic usage
3. **Explore:** `examples/html-template-demo` - All rendering modes
4. **Advanced:** `examples/reactive-demo` - Advanced features
5. **Reference:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

## 📊 Stats

- **50+ Features** implemented
- **3 Core Engines** (Script, Weave, Mesh)
- **3 Rendering Modes** (HTML, JS, Mixed)
- **3 Server Runtimes** (Basic, Advanced, Ultimate)
- **4 Priority Lanes** (input, animation, network, idle)
- **6 Complete Examples** with source code
- **Advanced Backend** (Routers, Pipelines, Channels, Collaboration)
- **Advanced Frontend** (ForgeFetch, NetHub, Request Helpers)
- **Enterprise Scale** (Compiler, Workers, Virtualization, Pooling)
- **Handles 10,000+ components** at 60fps
- **~10,000 lines** of production-ready code
- **~15,000 lines** of documentation
- **100% JavaScript** (no build required for development)

---

## 🙏 Credits

Created by **Saif Malik** (16 years old, Pakistan)

🌐 **Portfolio:** [www.infernusreal.com](https://www.infernusreal.com)  
🚀 **NASA Space Apps 2025:** [Team Perseverance5](https://www.spaceappschallenge.org/2025/find-a-team/perseverance5/)

Built with vision, engineered with excellence.

**ScrollForge** - The first implementation of Causal Graph Programming ✨

---

## 📄 Version

**Current:** v0.4.0 - Enterprise Scale  
**Status:** Production Ready ✅  
**Security:** Hardened ✅  
**Performance:** Optimized ✅  
**Scale:** Enterprise (10,000+ components) ✅  
**Backend:** Ultimate (Express-level + beyond) ✅  
**Frontend:** Complete (ForgeFetch, NetHub, Collaboration) ✅  
**Paradigm:** Causal Graph Programming ✨  

---

## 🆚 Comparison

| Feature | React | Vue | Svelte | **ScrollForge** |
|---------|-------|-----|--------|-----------------|
| State Management | useState | ref() | writable | ✅ Signals |
| Computed Values | useMemo | computed | $ | ✅ Built-in |
| Effects | useEffect | watch | $: | ✅ Auto |
| Styling | CSS-in-JS | Scoped | Scoped | ✅ Reactive |
| Animations | Libraries | Transition | Transition | ✅ Built-in |
| Time-Travel | DevTools | DevTools | - | ✅ Built-in |
| HTML Templates | JSX | Yes | Yes | ✅ Yes |
| JS Objects | - | Render fn | - | ✅ Yes |
| Server Runtime | Next.js | Nuxt | SvelteKit | ✅ Built-in |
| Visual Debugger | Extension | Extension | - | ✅ Built-in |
| Auto-Wiring | - | - | - | ✅ Unique |

---

🔥 **Happy Forging!** 🔥

