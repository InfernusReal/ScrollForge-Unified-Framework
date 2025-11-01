# 🎨 ScrollWeave Complete Guide

**Logic-Reactive Styling Engine**

> *"Style is not separate from behavior. CSS becomes runtime-controlled."*

---

## 📚 **TABLE OF CONTENTS**

1. [Philosophy - Logic-Reactive Styling](#philosophy---logic-reactive-styling)
2. [Core Methods](#core-methods)
3. [Conditional Styling](#conditional-styling)
4. [Animations](#animations)
5. [Design Tokens & Themes](#design-tokens--themes)
6. [Integration with ScrollMesh](#integration-with-scrollmesh)
7. [Performance](#performance)
8. [Complete API Reference](#complete-api-reference)

---

## 🎯 Philosophy - Logic-Reactive Styling

### **The Revolutionary Concept**

> *"CSS is not static. Style responds to state. Logic controls appearance."*

**Traditional CSS:**
```css
/* Static - never changes */
.button {
  background: blue;
  color: white;
}

/* Pseudo-classes only */
.button:hover {
  background: darkblue;
}
```

**ScrollWeave:**
```javascript
// Runtime-controlled - changes with state!
app.Weave.when('.button',
  isActive,  // Condition from state
  { background: 'green', transform: 'scale(1.1)' },  // Active
  { background: 'gray', transform: 'scale(1)' }      // Inactive
);

// State changes → Styles update automatically! ✨
```

---

## 🔧 Core Methods

### **1. Apply Styles**

**Syntax:**
```javascript
app.Weave.apply(selector, styles, transition);
```

**Examples:**

```javascript
// Basic
app.Weave.apply('.button', {
  background: '#667eea',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer'
});

// Multiple elements
app.Weave.apply('button', {
  cursor: 'pointer',
  transition: 'all 0.3s ease'
});

// By element reference
const el = document.querySelector('#my-div');
app.Weave.apply(el, {
  color: 'red',
  fontSize: '2rem'
});

// With transition
app.Weave.apply('.box', {
  background: 'blue'
}, {
  property: 'background',
  duration: 500,
  easing: 'ease-in-out'
});

// Responsive styling
app.Weave.apply('.container', {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px'
});

// CSS Grid
app.Weave.apply('.grid', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px'
});

// Flexbox
app.Weave.apply('.flex', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px'
});
```

**CSS Property Names:**
- Use camelCase: `backgroundColor`, `fontSize`, `borderRadius`
- Or kebab-case strings: `'background-color'`, `'font-size'`

---

## 🔀 Conditional Styling

### **2. When - If/Else Styles**

**Syntax:**
```javascript
app.Weave.when(selector, condition, thenStyles, elseStyles);
```

**Examples:**

```javascript
// Simple boolean
const isActive = true;
app.Weave.when('.button',
  isActive,
  { background: 'green', color: 'white' },
  { background: 'gray', color: '#666' }
);

// Function condition
app.Weave.when('.counter',
  () => app.Script.get('count') > 10,
  { fontSize: '3rem', color: 'red' },
  { fontSize: '1.5rem', color: 'blue' }
);

// State-based (in ScrollMesh)
(state, weave) => {
  weave.when('.status',
    state.isOnline,
    { background: '#4CAF50', color: 'white' },
    { background: '#F44336', color: 'white' }
  );
  
  weave.when('.progress',
    state.progress === 100,
    { background: 'green', width: '100%' },
    { background: 'blue', width: `${state.progress}%` }
  );
}

// Complex condition
app.Weave.when('.notification',
  () => {
    const unread = app.Script.get('unreadCount');
    const priority = app.Script.get('priority');
    return unread > 0 && priority === 'high';
  },
  { background: 'red', animation: 'pulse 1s infinite' },
  { background: 'transparent' }
);
```

### **3. Switch - Multiple Conditions**

**Syntax:**
```javascript
app.Weave.switch(selector, cases, defaultStyles);
```

**Examples:**

```javascript
const status = 'loading';

app.Weave.switch('.status-badge', [
  {
    condition: status === 'idle',
    styles: { 
      background: '#9E9E9E',
      color: 'white'
    }
  },
  {
    condition: status === 'loading',
    styles: { 
      background: '#2196F3',
      color: 'white',
      animation: 'pulse 1s infinite'
    }
  },
  {
    condition: status === 'success',
    styles: { 
      background: '#4CAF50',
      color: 'white'
    }
  },
  {
    condition: status === 'error',
    styles: { 
      background: '#F44336',
      color: 'white',
      fontWeight: 'bold'
    }
  }
], {
  // Default styles if no condition matches
  background: '#607D8B',
  color: 'white'
});

// In ScrollMesh
(state, weave) => {
  weave.switch('.priority-label', [
    { condition: state.priority === 'high', styles: { color: 'red' } },
    { condition: state.priority === 'medium', styles: { color: 'orange' } },
    { condition: state.priority === 'low', styles: { color: 'green' } }
  ], { color: 'gray' });
}
```

---

## ✨ Animations

### **4. Fade Animations**

```javascript
// Fade in
app.Weave.fadeIn('.modal', 300);  // 300ms

// Fade out
app.Weave.fadeOut('.modal', 300);

// In ScrollMesh
(events, state, weave) => {
  events.on('click', '.open-modal', () => {
    state.modalVisible = true;
    weave.fadeIn('.modal', 400);
  });
  
  events.on('click', '.close-modal', () => {
    weave.fadeOut('.modal', 400);
    setTimeout(() => {
      state.modalVisible = false;
    }, 400);
  });
}
```

### **5. Slide Animations**

```javascript
// Directions: 'up', 'down', 'left', 'right'
app.Weave.slideIn('.sidebar', 'left', 400);
app.Weave.slideIn('.dropdown', 'down', 300);
app.Weave.slideIn('.panel', 'right', 500);

// In ScrollMesh
(state, weave, effects) => {
  effects.when('sidebarOpen', (isOpen) => {
    if (isOpen) {
      weave.slideIn('.sidebar', 'left', 300);
    } else {
      weave.slideIn('.sidebar', 'left', 300);  // Slides out
    }
  });
}
```

### **6. Scale Animations**

```javascript
// Scale from small to normal
app.Weave.scale('.card', 0, 1, 300);

// Scale from normal to large
app.Weave.scale('.icon', 1, 1.2, 200);

// Pulse effect
setInterval(() => {
  app.Weave.scale('.pulse', 1, 1.1, 500);
  setTimeout(() => {
    app.Weave.scale('.pulse', 1.1, 1, 500);
  }, 500);
}, 1000);
```

### **7. Spring Physics**

```javascript
// Natural physics-based animation
app.Weave.spring('.element', {
  transform: 'translateY(0)',
  opacity: 1
}, {
  stiffness: 200,  // Higher = faster spring
  damping: 20,     // Higher = less bouncy
  mass: 1          // Weight of the object
});

// Button hover with spring
(events, weave) => {
  events.on('mouseenter', '.button', () => {
    weave.spring('.button', {
      transform: 'scale(1.1)',
      boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
    }, {
      stiffness: 300,
      damping: 15
    });
  });
  
  events.on('mouseleave', '.button', () => {
    weave.spring('.button', {
      transform: 'scale(1)',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }, {
      stiffness: 300,
      damping: 15
    });
  });
}
```

### **8. Custom Animations**

```javascript
// Web Animations API
app.Weave.animate('.spinner', [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' }
], {
  duration: 1000,
  iterations: Infinity,
  easing: 'linear'
});

// Keyframe animation
app.Weave.animate('.bounce', [
  { transform: 'translateY(0)' },
  { transform: 'translateY(-20px)' },
  { transform: 'translateY(0)' }
], {
  duration: 600,
  iterations: 3,
  easing: 'ease-in-out'
});

// Complex animation
app.Weave.animate('.complex', [
  { 
    transform: 'scale(1) rotate(0deg)',
    opacity: 1
  },
  { 
    transform: 'scale(1.5) rotate(180deg)',
    opacity: 0.5
  },
  { 
    transform: 'scale(1) rotate(360deg)',
    opacity: 1
  }
], {
  duration: 2000,
  iterations: Infinity,
  direction: 'alternate'
});
```

---

## 🎨 Design Tokens & Themes

### **9. Design Tokens**

```javascript
// Define tokens
app.Weave.token('primary', '#667eea');
app.Weave.token('secondary', '#764ba2');
app.Weave.token('success', '#4CAF50');
app.Weave.token('danger', '#F44336');
app.Weave.token('warning', '#FF9800');

app.Weave.token('spacing-sm', '8px');
app.Weave.token('spacing-md', '16px');
app.Weave.token('spacing-lg', '24px');

app.Weave.token('radius-sm', '4px');
app.Weave.token('radius-md', '8px');
app.Weave.token('radius-lg', '16px');

// Use tokens
app.Weave.apply('.button-primary', {
  background: app.Weave.getToken('primary'),
  padding: app.Weave.getToken('spacing-md'),
  borderRadius: app.Weave.getToken('radius-md')
});

app.Weave.apply('.button-danger', {
  background: app.Weave.getToken('danger'),
  color: 'white'
});
```

### **10. Themes**

```javascript
// Define themes
app.Weave.theme('dark', {
  background: '#1a1a1a',
  text: '#ffffff',
  primary: '#667eea',
  secondary: '#764ba2',
  border: '#333333'
});

app.Weave.theme('light', {
  background: '#ffffff',
  text: '#333333',
  primary: '#667eea',
  secondary: '#764ba2',
  border: '#e0e0e0'
});

// Apply theme
app.Weave.applyTheme('dark');

// Theme switcher
app.Script.signal('currentTheme', 'dark');

app.Script.watch('currentTheme', (theme) => {
  app.Weave.applyTheme(theme);
});

// Toggle themes
app.Script.action('TOGGLE_THEME', () => {
  const current = app.Script.get('currentTheme');
  const next = current === 'dark' ? 'light' : 'dark';
  app.Script.set('currentTheme', next);
});
```

---

## 🔗 Integration with ScrollMesh

### **Using Weave in Context Functions**

```javascript
HTMLScrollMesh(
  ({ count, isActive }) => `
    <div class="container">
      <h1 class="title">${count}</h1>
      <button class="btn">Click</button>
    </div>
  `,
  
  // Weave function gets state + weave context
  (state, weave) => {
    // Apply base styles
    weave.apply('.container', {
      padding: '20px',
      background: '#f5f5f5',
      borderRadius: '12px'
    });
    
    // Conditional styling based on state
    weave.when('.title',
      state.count > 10,
      { 
        color: 'green',
        fontSize: '3rem',
        fontWeight: 'bold'
      },
      { 
        color: 'blue',
        fontSize: '2rem',
        fontWeight: 'normal'
      }
    );
    
    // Active state styling
    weave.when('.btn',
      state.isActive,
      {
        background: '#4CAF50',
        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
        transform: 'scale(1.05)'
      },
      {
        background: '#9E9E9E',
        boxShadow: 'none',
        transform: 'scale(1)'
      }
    );
    
    // Animate on state change
    if (state.isActive) {
      weave.spring('.btn', {
        transform: 'scale(1.05)'
      });
    }
  },
  
  () => ({ count: 0, isActive: false })
);
```

### **Reactive Styling Examples**

```javascript
// Loading state
(state, weave) => {
  weave.when('.content',
    state.isLoading,
    { 
      opacity: 0.5,
      pointerEvents: 'none',
      filter: 'blur(2px)'
    },
    { 
      opacity: 1,
      pointerEvents: 'auto',
      filter: 'none'
    }
  );
}

// Error state
(state, weave) => {
  weave.when('.form-field',
    state.hasError,
    {
      borderColor: 'red',
      background: 'rgba(244, 67, 54, 0.1)',
      animation: 'shake 0.3s'
    },
    {
      borderColor: '#ddd',
      background: 'white'
    }
  );
}

// Progress bar
(state, weave) => {
  weave.apply('.progress-bar', {
    width: `${state.progress}%`,
    background: state.progress === 100 ? 'green' : 'blue',
    transition: 'all 0.3s ease'
  });
}

// Theme-based
(state, weave) => {
  weave.when('body',
    state.theme === 'dark',
    {
      background: '#1a1a1a',
      color: '#ffffff'
    },
    {
      background: '#ffffff',
      color: '#333333'
    }
  );
}
```

---

## 🎬 Animations

### **Built-in Animations**

```javascript
// Fade
app.Weave.fadeIn('.element', duration);
app.Weave.fadeOut('.element', duration);

// Slide
app.Weave.slideIn('.element', direction, duration);
// directions: 'up', 'down', 'left', 'right'

// Scale
app.Weave.scale('.element', from, to, duration);

// Spring
app.Weave.spring('.element', targetStyles, config);

// Custom
app.Weave.animate('.element', keyframes, options);
```

### **Animation Patterns**

```javascript
// Modal entrance
(state, weave, effects) => {
  effects.when('modalOpen', (isOpen) => {
    if (isOpen) {
      weave.fadeIn('.modal-overlay', 200);
      weave.spring('.modal-content', {
        transform: 'scale(1)',
        opacity: 1
      }, {
        stiffness: 200,
        damping: 20
      });
    }
  });
}

// List item entrance
(state, weave, effects) => {
  effects.when('items', (items) => {
    // Animate new items
    weave.fadeIn('.list-item:last-child', 300);
    weave.slideIn('.list-item:last-child', 'down', 300);
  });
}

// Notification toast
(state, weave) => {
  if (state.notification) {
    weave.slideIn('.toast', 'down', 300);
    
    // Auto-hide after 3s
    setTimeout(() => {
      weave.fadeOut('.toast', 300);
    }, 3000);
  }
}
```

---

## 🎯 Complete API Reference

```javascript
// Apply styles
app.Weave.apply(selector, styles, transition)

// Conditional
app.Weave.when(selector, condition, thenStyles, elseStyles)
app.Weave.switch(selector, cases, defaultStyles)

// Animations
app.Weave.fadeIn(selector, duration)
app.Weave.fadeOut(selector, duration)
app.Weave.slideIn(selector, direction, duration)
app.Weave.scale(selector, from, to, duration)
app.Weave.spring(selector, styles, config)
app.Weave.animate(selector, keyframes, options)

// Tokens
app.Weave.token(name, value)
app.Weave.getToken(name)

// Themes
app.Weave.theme(name, tokens)
app.Weave.applyTheme(name)

// Utilities
app.Weave.getStyles(selector)
app.Weave.clear(selector)
app.Weave.reset()
```

---

🔥 **ScrollWeave - Logic-Reactive Styling** 🔥

**CSS Becomes Runtime-Controlled**
**State Drives Appearance**
**Animations Built-In** ✨

