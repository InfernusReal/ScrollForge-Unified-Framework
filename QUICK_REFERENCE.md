# 🔥 ScrollForge Quick Reference

One-page cheat sheet for ScrollForge development.

---

## 📦 Installation & Setup

```bash
# Create new project
npx scrollforge create my-app

# Or install manually
npm install scrollforge
```

```javascript
import ScrollForge from 'scrollforge';
const app = new ScrollForge();
```

---

## ⚡ ScrollScript - Data Flow

### Signals
```javascript
// Create
app.Script.signal('name', 'value');

// Get
const value = app.Script.get('name');

// Set
app.Script.set('name', newValue);

// Watch
app.Script.watch('name', (newValue, oldValue) => {
  console.log('Changed!', newValue);
});

// Derived
app.Script.derived('fullName', () => {
  return `${app.Script.get('first')} ${app.Script.get('last')}`;
}, ['first', 'last']);
```

### Actions
```javascript
// Define
app.Script.action('ACTION_NAME', (payload) => {
  // Update state
  app.Script.set('value', payload.value);
});

// Trigger
app.Script.trigger('ACTION_NAME', { value: 123 });

// With options
app.Script.action('ACTION', handler, {
  guard: (payload) => payload.valid,
  transform: (payload) => ({ ...payload, timestamp: Date.now() }),
  sideEffects: [(payload) => console.log('Side effect!')]
});
```

### Event Bindings
```javascript
// Click
app.Script.onClick('#button', 'BUTTON_CLICKED');

// Keyboard
app.Script.onKey('Enter', 'SUBMIT');
app.Script.onKey('Escape', 'CANCEL');

// Scroll
app.Script.onScroll('SCROLL_UPDATED', 100); // throttled

// Input
app.Script.onInput('#input', 'INPUT_CHANGED');

// Form
app.Script.onSubmit('#form', 'FORM_SUBMITTED');

// Pointer
app.Script.onPointer('MOUSE_MOVED');

// Animation frame
app.Script.onFrame('FRAME_UPDATE');
```

### Utilities
```javascript
// Persist to localStorage
app.Script.persist('signalName');

// Sync across tabs
app.Script.sync('signalName');

// Time-travel
app.Script.undo();
app.Script.jumpTo(epoch);

// Debounce/Throttle
const debouncedAction = app.Script.debounce('ACTION', 300);
const throttledAction = app.Script.throttle('ACTION', 100);
```

---

## 🎨 ScrollWeave - Styling

### Apply Styles
```javascript
// Direct
app.Weave.apply('.element', {
  background: 'blue',
  padding: '10px',
  borderRadius: '5px',
});

// With transition
app.Weave.apply('.element', styles, {
  property: 'all',
  duration: 300,
  easing: 'ease',
});
```

### Conditional Styling
```javascript
// If-then-else
app.Weave.when(
  '.element',
  condition,
  { background: 'green' },  // then
  { background: 'red' }     // else
);

// Switch-like
app.Weave.switch('.element', [
  { condition: x === 1, styles: { color: 'red' } },
  { condition: x === 2, styles: { color: 'blue' } },
], { color: 'black' }); // default
```

### Animations
```javascript
// Fade
app.Weave.fadeIn('.modal', 300);
app.Weave.fadeOut('.modal', 300);

// Slide
app.Weave.slideIn('.sidebar', 'left', 400);

// Scale
app.Weave.scale('.card', 0, 1, 300);

// Spring
app.Weave.spring('.element', {
  transform: 'translateY(0)',
  opacity: 1,
}, {
  stiffness: 200,
  damping: 20,
  mass: 1,
});

// Custom
app.Weave.animate('.element', [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' },
], {
  duration: 1000,
  easing: 'ease-in-out',
  iterations: Infinity,
});
```

### Tokens & Themes
```javascript
// Define token
app.Weave.token('primary', '#667eea');

// Use token
const color = app.Weave.getToken('primary');

// Theme
app.Weave.theme('dark', {
  background: '#000',
  text: '#fff',
});

app.Weave.applyTheme('dark');
```

---

## 🏗️ ScrollMesh - Components

### Blueprints
```javascript
// Define
app.Mesh.blueprint('Button', (props) => ({
  tag: 'button',
  attrs: { class: 'btn' },
  content: props.label,
  style: { padding: '10px 20px' },
  events: {
    click: props.onClick,
  },
}));

// With children
app.Mesh.blueprint('Card', (props, children) => ({
  tag: 'div',
  attrs: { class: 'card' },
  children: [
    { tag: 'h2', content: props.title },
    ...children,
  ],
}));
```

### Create & Render
```javascript
// Create instance
const button = app.Mesh.create('Button', {
  label: 'Click me',
  onClick: () => console.log('Clicked!'),
});

// Render
app.Mesh.render(button, '#app');

// Update
app.Mesh.update(button, { label: 'Updated!' });

// Unmount
app.Mesh.unmount(button);
```

### Helpers
```javascript
// Repeat (list)
const items = app.Mesh.repeat(data, (item, i) =>
  app.Mesh.create('ListItem', { item, index: i })
);

// Conditional
const content = app.Mesh.when(
  isLoggedIn,
  app.Mesh.create('Dashboard'),
  app.Mesh.create('Login')
);

// Fragment
const elements = app.Mesh.fragment(
  app.Mesh.create('Header'),
  app.Mesh.create('Body'),
  app.Mesh.create('Footer')
);

// Virtual list
app.Mesh.virtualList('#container', largeArray, (item) =>
  app.Mesh.create('Item', { item })
, { itemHeight: 50, overscan: 3 });
```

### Connectors
```javascript
// Define connector
app.Mesh.connector('App', (context, mesh) => ({
  tag: 'div',
  attrs: { class: 'app' },
  children: [
    mesh.create('Header', context.header),
    mesh.create('Body', context.body),
    mesh.create('Footer', context.footer),
  ],
}));

// Use connector
const app = app.Mesh.assemble('App', {
  header: { title: 'My App' },
  body: { content: 'Hello!' },
  footer: { year: 2025 },
});
```

---

## 🔗 Integration Patterns

### Pattern 1: Signal → Watch → Render
```javascript
app.Script.signal('data', null);

app.Script.watch('data', render);

function render() {
  const data = app.Script.get('data');
  const component = app.Mesh.create('MyComponent', { data });
  app.Mesh.render(component, '#app');
}
```

### Pattern 2: Signal → Style
```javascript
app.Script.watch('isActive', (isActive) => {
  app.Weave.apply('.element', {
    background: isActive ? 'green' : 'gray',
  });
});
```

### Pattern 3: Event → Action → State → Render
```javascript
// 1. Event binding
app.Script.onClick('#button', 'BUTTON_CLICKED');

// 2. Action handler
app.Script.action('BUTTON_CLICKED', () => {
  app.Script.set('clicks', app.Script.get('clicks') + 1);
});

// 3. Watch and render
app.Script.watch('clicks', render);
```

---

## 🛠️ CLI Commands

```bash
# Create project
sf create my-app
sf create my-app --template counter
sf create my-app --template scroll

# Dev server
sf dev
sf dev --port 8080
sf dev --open

# Build
sf build
sf build --output dist
sf build --minify
```

---

## 🎯 Common Patterns

### Reactive Counter
```javascript
app.Script.signal('count', 0);
app.Script.action('INC', () => app.Script.set('count', app.Script.get('count') + 1));
app.Script.onKey('ArrowUp', 'INC');
```

### Form Handling
```javascript
app.Script.signal('formData', {});
app.Script.onSubmit('#form', 'SUBMIT');
app.Script.action('SUBMIT', (payload) => {
  console.log('Form data:', payload);
});
```

### Conditional Rendering
```javascript
function render() {
  const isLoggedIn = app.Script.get('isLoggedIn');
  const component = isLoggedIn
    ? app.Mesh.create('Dashboard')
    : app.Mesh.create('Login');
  app.Mesh.render(component, '#app');
}
```

### Animated Transitions
```javascript
app.Script.watch('currentPage', (page) => {
  app.Weave.fadeOut('.page', 200);
  setTimeout(() => {
    // Update content
    app.Weave.fadeIn('.page', 200);
  }, 200);
});
```

---

## 🐛 Debugging

```javascript
// Enable debug mode
const app = new ScrollForge({ debugMode: true });

// Time-travel
app.Script.undo();
app.Script.jumpTo(epoch);

// Inspect state
console.log(app.Script.getAllSignals());
console.log(app.Script.getHistory());

// Watch all changes
app.Script.watch('*', (name, value) => {
  console.log(`${name} changed to`, value);
});
```

---

## 📚 Resources

- [Full Docs](./README.md)
- [Getting Started](./GETTING_STARTED.md)
- [Examples](./examples)
- [Contributing](./CONTRIBUTING.md)

---

🔥 **Happy Forging!** 🔥

