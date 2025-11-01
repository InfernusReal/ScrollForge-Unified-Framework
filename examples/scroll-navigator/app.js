/**
 * ScrollForge Scroll Navigator Example
 * Demonstrates scroll-driven UI with arrow key navigation
 * (From the whitepaper example)
 */

import ScrollForge from '../../src/index.js';

const app = new ScrollForge({ debugMode: true });

// ===== ScrollScript: State Management =====
const sections = [
  { id: 0, title: 'Welcome to ScrollForge', color: '#667eea' },
  { id: 1, title: 'ScrollScript Engine', color: '#f093fb' },
  { id: 2, title: 'ScrollWeave Styling', color: '#4facfe' },
  { id: 3, title: 'ScrollMesh Assembly', color: '#43e97b' },
  { id: 4, title: 'The Future is Here', color: '#fa709a' },
];

// Signals
app.Script.signal('index', 0);
app.Script.signal('isAnimating', false);

// Derived signal
app.Script.derived('currentSection', () => {
  const index = app.Script.get('index');
  return sections[index];
}, ['index']);

// Actions
app.Script.action('NEXT', () => {
  if (app.Script.get('isAnimating')) return;
  
  const index = app.Script.get('index');
  const newIndex = Math.min(index + 1, sections.length - 1);
  
  if (newIndex !== index) {
    app.Script.set('isAnimating', true);
    app.Script.set('index', newIndex);
    
    setTimeout(() => {
      app.Script.set('isAnimating', false);
    }, 600);
  }
});

app.Script.action('PREV', () => {
  if (app.Script.get('isAnimating')) return;
  
  const index = app.Script.get('index');
  const newIndex = Math.max(index - 1, 0);
  
  if (newIndex !== index) {
    app.Script.set('isAnimating', true);
    app.Script.set('index', newIndex);
    
    setTimeout(() => {
      app.Script.set('isAnimating', false);
    }, 600);
  }
});

app.Script.action('GOTO', (payload) => {
  if (app.Script.get('isAnimating')) return;
  
  const targetIndex = payload.index;
  const currentIndex = app.Script.get('index');
  
  if (targetIndex !== currentIndex) {
    app.Script.set('isAnimating', true);
    app.Script.set('index', targetIndex);
    
    setTimeout(() => {
      app.Script.set('isAnimating', false);
    }, 600);
  }
});

// ===== ScrollMesh: Component Structure =====
// Section component
app.Mesh.blueprint('Section', (props) => ({
  tag: 'div',
  attrs: {
    class: `section section-${props.id}`,
    'data-id': props.id,
  },
  style: {
    background: props.color,
  },
  children: [
    {
      tag: 'div',
      attrs: { class: 'section-content' },
      children: [
        {
          tag: 'h1',
          content: props.title,
          style: {
            textAlign: 'center',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          },
        },
      ],
    },
  ],
}));

// Navigation indicator
app.Mesh.blueprint('NavIndicator', (props) => ({
  tag: 'div',
  attrs: { class: 'nav-indicator' },
  children: props.sections.map((section, i) => ({
    tag: 'div',
    attrs: {
      class: `nav-dot ${i === props.activeIndex ? 'active' : ''}`,
      'data-index': i,
    },
    events: {
      click: () => app.Script.trigger('GOTO', { index: i }),
    },
  })),
}));

// Instructions
app.Mesh.blueprint('Instructions', () => ({
  tag: 'div',
  attrs: { class: 'instructions' },
  children: [
    {
      tag: 'p',
      content: 'Use Arrow Keys to Navigate | Click dots to jump',
    },
  ],
}));

// Main connector
app.Mesh.connector('App', (context, mesh) => ({
  tag: 'div',
  attrs: { class: 'scroll-app' },
  children: [
    ...context.sections.map((section) =>
      mesh.create('Section', section)
    ),
    mesh.create('NavIndicator', {
      sections: context.sections,
      activeIndex: context.index,
    }),
    mesh.create('Instructions'),
  ],
}));

// ===== ScrollWeave: Reactive Animations =====
// Watch index changes and animate sections
app.Script.watch('index', (index) => {
  sections.forEach((section, i) => {
    const selector = `.section-${section.id}`;
    
    if (i === index) {
      // Active section
      app.Weave.apply(selector, {
        opacity: '1',
        transform: 'translateY(0)',
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: '10',
      });
    } else if (i < index) {
      // Previous sections (slide up)
      app.Weave.apply(selector, {
        opacity: '0',
        transform: 'translateY(-100px)',
        transition: 'all 0.6s ease-out',
        zIndex: '1',
      });
    } else {
      // Next sections (slide down)
      app.Weave.apply(selector, {
        opacity: '0',
        transform: 'translateY(100px)',
        transition: 'all 0.6s ease-out',
        zIndex: '1',
      });
    }
  });
});

// ===== Render =====
function render() {
  const index = app.Script.get('index');
  
  const appComponent = app.Mesh.assemble('App', {
    sections,
    index,
  });
  
  app.Mesh.render(appComponent, '#app');
  
  // Initial animation state
  setTimeout(() => {
    sections.forEach((section, i) => {
      const selector = `.section-${section.id}`;
      
      if (i === 0) {
        app.Weave.apply(selector, {
          opacity: '1',
          transform: 'translateY(0)',
          zIndex: '10',
        });
      } else {
        app.Weave.apply(selector, {
          opacity: '0',
          transform: 'translateY(100px)',
          zIndex: '1',
        });
      }
    });
  }, 0);
}

// Watch and re-render
app.Script.watch('index', render);

// Initial render
render();

// ===== Event Bindings =====
// Arrow keys
app.Script.onKey('ArrowDown', 'NEXT');
app.Script.onKey('ArrowUp', 'PREV');

// Mouse wheel
let wheelTimeout;
window.addEventListener('wheel', (e) => {
  clearTimeout(wheelTimeout);
  wheelTimeout = setTimeout(() => {
    if (e.deltaY > 0) {
      app.Script.trigger('NEXT');
    } else {
      app.Script.trigger('PREV');
    }
  }, 50);
});

// Touch swipe
let touchStart = 0;
window.addEventListener('touchstart', (e) => {
  touchStart = e.touches[0].clientY;
});

window.addEventListener('touchend', (e) => {
  const touchEnd = e.changedTouches[0].clientY;
  const diff = touchStart - touchEnd;
  
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      app.Script.trigger('NEXT');
    } else {
      app.Script.trigger('PREV');
    }
  }
});

console.log('ScrollForge Scroll Navigator loaded!');
console.log('Use Arrow Up/Down, mouse wheel, or touch swipe to navigate');

