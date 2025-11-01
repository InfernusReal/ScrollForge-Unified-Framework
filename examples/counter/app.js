/**
 * ScrollForge Counter Example
 * Demonstrates all three engines working together
 */

import ScrollForge from '../../src/index.js';

// Create ScrollForge instance
const app = new ScrollForge({ debugMode: true });

// ===== ScrollScript: Data Flow =====
// Create signals
app.Script.signal('count', 0);
app.Script.signal('isEven', true);

// Derived signal
app.Script.derived(
  'isEven',
  () => app.Script.get('count') % 2 === 0,
  ['count']
);

// Actions
app.Script.action('INCREMENT', () => {
  const count = app.Script.get('count');
  app.Script.set('count', count + 1);
});

app.Script.action('DECREMENT', () => {
  const count = app.Script.get('count');
  app.Script.set('count', count - 1);
});

app.Script.action('RESET', () => {
  app.Script.set('count', 0);
});

// ===== ScrollMesh: Component Structure =====
// Counter display component
app.Mesh.blueprint('CounterDisplay', (props) => ({
  tag: 'div',
  attrs: { class: 'counter-display' },
  children: [
    {
      tag: 'h1',
      attrs: { class: 'count-value' },
      content: props.count.toString(),
    },
    {
      tag: 'p',
      attrs: { class: 'count-status' },
      content: props.isEven ? 'Even Number' : 'Odd Number',
    },
  ],
}));

// Button component
app.Mesh.blueprint('Button', (props) => ({
  tag: 'button',
  attrs: { class: `btn ${props.variant || ''}`.trim() },
  content: props.label,
  events: {
    click: props.onClick,
  },
}));

// Main counter component (connector pattern)
app.Mesh.connector('Counter', (context, mesh) => {
  return {
    tag: 'div',
    attrs: { class: 'counter-app' },
    children: [
      {
        tag: 'h2',
        content: 'ScrollForge Counter',
        style: { marginBottom: '2rem', color: '#667eea' },
      },
      mesh.create('CounterDisplay', {
        count: context.count,
        isEven: context.isEven,
      }),
      {
        tag: 'div',
        attrs: { class: 'button-group' },
        style: { display: 'flex', gap: '1rem', marginTop: '2rem' },
        children: [
          mesh.create('Button', {
            label: '- Decrement',
            variant: 'secondary',
            onClick: () => app.Script.trigger('DECREMENT'),
          }),
          mesh.create('Button', {
            label: 'Reset',
            variant: 'danger',
            onClick: () => app.Script.trigger('RESET'),
          }),
          mesh.create('Button', {
            label: '+ Increment',
            variant: 'primary',
            onClick: () => app.Script.trigger('INCREMENT'),
          }),
        ],
      },
    ],
  };
});

// ===== ScrollWeave: Reactive Styling =====
// Base styles
app.Weave.apply('.counter-app', {
  minWidth: '300px',
});

app.Weave.apply('.count-value', {
  fontSize: '4rem',
  fontWeight: 'bold',
  margin: '1rem 0',
  color: '#333',
});

app.Weave.apply('.count-status', {
  fontSize: '1.2rem',
  color: '#666',
  margin: '0.5rem 0',
});

app.Weave.apply('.btn', {
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  fontWeight: '600',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  flex: '1',
});

// ===== Integration: Reactive Style Updates =====
// Update count color based on value
app.Script.watch('count', (count) => {
  const color = count > 0 ? '#10b981' : count < 0 ? '#ef4444' : '#333';

  app.Weave.apply('.count-value', {
    color,
    transform: 'scale(1.1)',
  });

  // Animate back
  setTimeout(() => {
    app.Weave.apply('.count-value', {
      transform: 'scale(1)',
    });
  }, 150);
});

// Update status style based on even/odd
app.Script.watch('isEven', (isEven) => {
  app.Weave.apply('.count-status', {
    color: isEven ? '#3b82f6' : '#f59e0b',
    fontWeight: isEven ? 'normal' : 'bold',
  });
});

// ===== Render Function =====
function render() {
  const count = app.Script.get('count');
  const isEven = app.Script.get('isEven');

  const counterComponent = app.Mesh.assemble('Counter', { count, isEven });
  app.Mesh.render(counterComponent, '#app');

  // Apply button styles after render
  setTimeout(() => {
    app.Weave.apply('.btn.primary', {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    });

    app.Weave.apply('.btn.secondary', {
      background: '#e5e7eb',
      color: '#374151',
    });

    app.Weave.apply('.btn.danger', {
      background: '#ef4444',
      color: 'white',
    });

    // Hover effects
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        app.Weave.apply(btn, {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        });
      });

      btn.addEventListener('mouseleave', () => {
        app.Weave.apply(btn, {
          transform: 'translateY(0)',
          boxShadow: 'none',
        });
      });
    });
  }, 0);
}

// Watch signals and re-render
app.Script.watch('count', render);
app.Script.watch('isEven', render);

// Initial render
render();

// Keyboard shortcuts
app.Script.onKey('ArrowUp', 'INCREMENT');
app.Script.onKey('ArrowDown', 'DECREMENT');
app.Script.onKey('r', 'RESET');

console.log('ScrollForge Counter loaded!');
