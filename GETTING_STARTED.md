# 🚀 Getting Started with ScrollForge

Welcome to **ScrollForge** - the unified reactive framework that will change how you build web applications!

---

## 📦 Installation

### Option 1: Use the CLI (Recommended)

```bash
npx scrollforge create my-app
cd my-app
npm install
npm run dev
```

### Option 2: Manual Installation

```bash
npm install scrollforge
```

---

## 🎯 Your First ScrollForge App

Create an `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My ScrollForge App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>
```

Create an `app.js`:

```javascript
import ScrollForge from 'scrollforge';

// Initialize ScrollForge
const app = new ScrollForge();

// Create a signal (reactive state)
app.Script.signal('message', 'Hello ScrollForge!');

// Create a component
app.Mesh.blueprint('App', (props) => ({
  tag: 'div',
  style: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  content: props.message,
}));

// Render
const appComponent = app.Mesh.create('App', {
  message: app.Script.get('message'),
});

app.Mesh.render(appComponent, '#app');
```

---

## 🔥 Understanding the Three Engines

### ⚡ ScrollScript - Data Flow

Think of ScrollScript as your **state manager** and **event orchestrator**.

```javascript
// 1. Create signals (reactive values)
app.Script.signal('count', 0);

// 2. Define actions (how state changes)
app.Script.action('INCREMENT', () => {
  const count = app.Script.get('count');
  app.Script.set('count', count + 1);
});

// 3. Trigger actions
app.Script.trigger('INCREMENT');

// 4. Watch for changes
app.Script.watch('count', (newValue) => {
  console.log('Count changed to:', newValue);
});
```

**Key Concept**: Everything flows through signals and actions. No direct mutations!

---

### 🎨 ScrollWeave - Styling

Think of ScrollWeave as **CSS with superpowers** - it responds to your state!

```javascript
// Apply styles
app.Weave.apply('.button', {
  background: 'blue',
  padding: '10px 20px',
  borderRadius: '5px',
});

// Conditional styling
const isActive = true;
app.Weave.when(
  '.button',
  isActive,
  { background: 'green' },  // if true
  { background: 'gray' }    // if false
);

// Animations
app.Weave.fadeIn('.modal', 300);
app.Weave.spring('.card', {
  transform: 'translateY(0)',
  opacity: 1,
});
```

**Key Concept**: Styles react to state changes automatically!

---

### 🏗️ ScrollMesh - Components

Think of ScrollMesh as your **component builder** - it creates the structure.

```javascript
// Define a component blueprint
app.Mesh.blueprint('Button', (props) => ({
  tag: 'button',
  attrs: { class: 'btn' },
  content: props.label,
  events: {
    click: props.onClick,
  },
}));

// Create an instance
const button = app.Mesh.create('Button', {
  label: 'Click me!',
  onClick: () => alert('Clicked!'),
});

// Render it
app.Mesh.render(button, '#app');
```

**Key Concept**: Components are just data structures until you render them!

---

## 🎨 Putting It All Together

Let's build a simple counter that uses all three engines:

```javascript
import ScrollForge from 'scrollforge';

const app = new ScrollForge();

// ===== ScrollScript: State & Logic =====
app.Script.signal('count', 0);

app.Script.action('INCREMENT', () => {
  app.Script.set('count', app.Script.get('count') + 1);
});

app.Script.action('DECREMENT', () => {
  app.Script.set('count', app.Script.get('count') - 1);
});

// ===== ScrollMesh: Structure =====
app.Mesh.blueprint('Counter', (props) => ({
  tag: 'div',
  attrs: { class: 'counter' },
  children: [
    {
      tag: 'h1',
      attrs: { class: 'count-display' },
      content: `Count: ${props.count}`,
    },
    {
      tag: 'button',
      content: '-',
      events: { click: () => app.Script.trigger('DECREMENT') },
    },
    {
      tag: 'button',
      content: '+',
      events: { click: () => app.Script.trigger('INCREMENT') },
    },
  ],
}));

// ===== ScrollWeave: Reactive Styling =====
app.Script.watch('count', (count) => {
  // Change color based on value
  const color = count > 0 ? 'green' : count < 0 ? 'red' : 'black';
  
  app.Weave.apply('.count-display', {
    color,
    transform: 'scale(1.1)',
    transition: 'all 0.3s ease',
  });
  
  // Animate back to normal
  setTimeout(() => {
    app.Weave.apply('.count-display', {
      transform: 'scale(1)',
    });
  }, 150);
});

// ===== Render =====
function render() {
  const count = app.Script.get('count');
  const counter = app.Mesh.create('Counter', { count });
  app.Mesh.render(counter, '#app');
}

// Re-render when count changes
app.Script.watch('count', render);

// Initial render
render();
```

---

## 🎯 Key Patterns

### Pattern 1: Signal → Watch → Render

```javascript
// 1. Create signal
app.Script.signal('data', null);

// 2. Watch for changes
app.Script.watch('data', render);

// 3. Render function
function render() {
  const data = app.Script.get('data');
  // ... create and render components
}
```

### Pattern 2: Event → Action → State

```javascript
// 1. Define action
app.Script.action('BUTTON_CLICKED', (payload) => {
  // Update state
  app.Script.set('clicks', app.Script.get('clicks') + 1);
});

// 2. Bind event to action
app.Script.onClick('#button', 'BUTTON_CLICKED');
```

### Pattern 3: State → Style

```javascript
// Watch state and update styles
app.Script.watch('isActive', (isActive) => {
  app.Weave.apply('.element', {
    background: isActive ? 'green' : 'gray',
  });
});
```

---

## 🚀 Next Steps

1. **Explore Examples**: Check out `/examples` for complete apps
2. **Read the Docs**: See `README.md` for full API reference
3. **Build Something**: Start with the counter, then try the scroll navigator
4. **Join Community**: Share what you build!

---

## 💡 Pro Tips

1. **Use Derived Signals** for computed values:
   ```javascript
   app.Script.derived('fullName', () => {
     return `${app.Script.get('firstName')} ${app.Script.get('lastName')}`;
   }, ['firstName', 'lastName']);
   ```

2. **Persist Important State**:
   ```javascript
   app.Script.persist('userSettings');
   ```

3. **Use Keyboard Shortcuts**:
   ```javascript
   app.Script.onKey('Enter', 'SUBMIT');
   app.Script.onKey('Escape', 'CANCEL');
   ```

4. **Debug with Time-Travel**:
   ```javascript
   app.Script.undo(); // Go back one action
   ```

---

## 🆘 Common Issues

### Issue: Components not updating

**Solution**: Make sure you're watching the right signals and calling render:

```javascript
app.Script.watch('mySignal', render);
```

### Issue: Styles not applying

**Solution**: Apply styles after render using setTimeout:

```javascript
setTimeout(() => {
  app.Weave.apply('.element', styles);
}, 0);
```

### Issue: Events not firing

**Solution**: Events must be bound after elements exist in DOM. Use the render function.

---

## 📚 Resources

- [Full Documentation](./README.md)
- [API Reference](./API.md)
- [Examples](./examples)
- [Whitepaper](./WHITEPAPER.md)

---

🔥 **Welcome to the future of web development!** 🔥

