/**
 * ScrollForge HTML Template Demo
 * Shows how HTML, Weave, and Mesh work together
 */

import ScrollForge from '../../src/index.js';
import { HTMLScrollMesh } from '../../src/mesh/html-context.js';

// Make app global for context access
window.app = new ScrollForge({ debugMode: true });

console.log('== ScrollForge HTML Template Demo ==');

// ===== EXAMPLE 1: Simple Counter with HTML =====
const Counter = HTMLScrollMesh(
  // Function 1: HTML Template
  ({ count, message }) => `
    <div style="text-align: center; padding: 2rem;">
      <h2 style="color: #667eea; margin-bottom: 1rem;">${message}</h2>
      <div class="count-display" style="
        font-size: 3rem;
        font-weight: bold;
        margin: 2rem 0;
      ">
        ${count}
      </div>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button class="decrement-btn">-</button>
        <button class="reset-btn">Reset</button>
        <button class="increment-btn">+</button>
      </div>
    </div>
  `,
  
  // Function 2: ScrollWeave Dynamic Styling
  (state, weave) => {
    // Conditional styling based on count
    weave.when('.count-display',
      state.count > 5,
      { 
        color: 'green',
        transform: 'scale(1.2)',
        textShadow: '0 4px 8px rgba(0,255,0,0.3)'
      },
      { 
        color: state.count < 0 ? 'red' : '#333',
        transform: 'scale(1)',
        textShadow: 'none'
      }
    );

    // Button hover effects
    weave.on('.decrement-btn', 'mouseenter', {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    });

    weave.on('.decrement-btn', 'mouseleave', {
      transform: 'translateY(0)',
      boxShadow: 'none'
    });

    weave.on('.increment-btn', 'mouseenter', {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    });

    weave.on('.increment-btn', 'mouseleave', {
      transform: 'translateY(0)',
      boxShadow: 'none'
    });
  },
  
  // Function 3: Logic (Event Handlers)
  (events, state) => {
    events.on('click', '.increment-btn', () => {
      state.count++;
      state.message = `Count: ${state.count}`;
    });

    events.on('click', '.decrement-btn', () => {
      state.count--;
      state.message = `Count: ${state.count}`;
    });

    events.on('click', '.reset-btn', () => {
      state.count = 0;
      state.message = 'Reset!';
    });
  },
  
  // Function 4: State
  () => ({
    count: 0,
    message: 'Click the buttons!'
  })
);

// Mount the component
Counter.mount('#app');

// Apply button base styles with ScrollWeave
setTimeout(() => {
  window.app.Weave.apply('button', {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: '#667eea',
    color: 'white'
  });

  window.app.Weave.apply('.reset-btn', {
    background: '#ef4444'
  });

  window.app.Weave.apply('.decrement-btn', {
    background: '#f59e0b'
  });

  window.app.Weave.apply('.increment-btn', {
    background: '#10b981'
  });
}, 100);

console.log('[ok] HTML Template demo loaded!');
console.log('Features demonstrated:');
console.log('  1. HTML template strings');
console.log('  2. State interpolation ${...}');
console.log('  3. ScrollWeave dynamic styling');
console.log('  4. Event binding from HTML');
console.log('  5. Auto-rendering on state change');

