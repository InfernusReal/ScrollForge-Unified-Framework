/**
 * ScrollForge Reactive Components Demo
 * Showcasing all new features
 */

import ScrollForge from '../../src/index.js';
import { ScrollMesh } from '../../src/mesh/context.js';

// Make app global for context access
window.app = new ScrollForge({ debugMode: true });

console.log('== ScrollForge Reactive Demo ==');

// ===== DEMO 1: Context System (Auto-Wiring) =====
const ContextDemo = ScrollMesh(
  // Function 1: UI
  ({ count, message }) => ({
    tag: 'div',
    children: [
      {
        tag: 'h3',
        content: message,
        style: { color: '#667eea', marginBottom: '1rem' }
      },
      {
        tag: 'div',
        style: { fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' },
        content: `Count: ${count}`
      },
      {
        tag: 'button',
        content: 'Increment',
        events: {
          click: () => {
            // Trigger custom event
            if (window.contextEvents) {
              window.contextEvents.emit('increment');
            }
          }
        }
      }
    ]
  }),
  
  // Function 2: Event Logic
  (events, state) => {
    window.contextEvents = events;
    
    events.on('increment', () => {
      state.count++;
      state.message = `Clicked ${state.count} times!`;
    });
  },
  
  // Function 3: State
  () => ({
    count: 0,
    message: 'Click the button!'
  }),
  
  // Function 4: Side Effects
  (state, effects) => {
    effects.when('count', (count) => {
      if (count > 5) {
        console.log('Count exceeded 5!');
      }
    });
  }
);

ContextDemo.mount('#context-demo');

// ===== DEMO 2: Reactive Component (Auto-Render) =====
const ReactiveDemo = app.Mesh.component('ReactiveCounter', {
  state: {
    count: 0,
    color: 'blue'
  },
  
  render({ count, color }) {
    return {
      tag: 'div',
      children: [
        {
          tag: 'div',
          style: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: color,
            margin: '1rem 0'
          },
          content: `Reactive Count: ${count}`
        },
        {
          tag: 'button',
          content: '+1',
          events: {
            click: () => {
              this.state.count++;
              this.state.color = this.state.count % 2 === 0 ? 'blue' : 'green';
            }
          }
        }
      ]
    };
  }
});

ReactiveDemo.mount('#reactive-demo');

// ===== DEMO 3: Computed State & Selectors =====
const ComputedDemo = ScrollMesh(
  // UI
  ({ firstName, lastName, fullName, age }) => ({
    tag: 'div',
    children: [
      {
        tag: 'div',
        style: { marginBottom: '1rem' },
        children: [
          { tag: 'label', content: 'First Name: ' },
          {
            tag: 'input',
            attrs: { value: firstName, placeholder: 'First Name' },
            events: {
              input: (e) => {
                if (window.computedState) {
                  window.computedState.firstName = e.target.value;
                }
              }
            }
          }
        ]
      },
      {
        tag: 'div',
        style: { marginBottom: '1rem' },
        children: [
          { tag: 'label', content: 'Last Name: ' },
          {
            tag: 'input',
            attrs: { value: lastName, placeholder: 'Last Name' },
            events: {
              input: (e) => {
                if (window.computedState) {
                  window.computedState.lastName = e.target.value;
                }
              }
            }
          }
        ]
      },
      {
        tag: 'div',
        style: { fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' },
        content: `Full Name: ${fullName}`
      },
      {
        tag: 'div',
        style: { fontSize: '1.2rem', marginTop: '0.5rem' },
        content: `Age: ${age}`
      }
    ]
  }),
  
  // State with computed properties
  () => {
    const state = {
      firstName: 'John',
      lastName: 'Doe',
      birthYear: 1990,
      
      // Computed properties
      computed: {
        fullName: (state) => `${state.firstName} ${state.lastName}`,
        age: (state) => new Date().getFullYear() - state.birthYear
      }
    };
    
    window.computedState = null; // Will be set by proxy
    return state;
  }
);

// Store state reference for input handlers
setTimeout(() => {
  window.computedState = ComputedDemo.state;
}, 0);

ComputedDemo.mount('#computed-demo');

// ===== DEMO 4: Time-Travel (Undo/Redo) =====
const HistoryDemo = app.Mesh.component('HistoryCounter', {
  state: {
    count: 0
  },
  
  history: true, // Enable time-travel!
  
  render({ count }) {
    return {
      tag: 'div',
      children: [
        {
          tag: 'div',
          style: { fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' },
          content: `Count: ${count}`
        },
        {
          tag: 'div',
          children: [
            {
              tag: 'button',
              content: '+1',
              events: {
                click: () => {
                  this.state.count++;
                }
              }
            },
            {
              tag: 'button',
              content: '-1',
              events: {
                click: () => {
                  this.state.count--;
                }
              }
            },
            {
              tag: 'button',
              content: 'Undo',
              style: { background: '#f59e0b' },
              events: {
                click: () => {
                  this.undo();
                }
              }
            },
            {
              tag: 'button',
              content: 'Redo',
              style: { background: '#10b981' },
              events: {
                click: () => {
                  this.redo();
                }
              }
            }
          ]
        },
        {
          tag: 'div',
          style: { marginTop: '1rem', fontSize: '0.9rem', color: '#666' },
          content: `History: ${this.history.length} snapshots`
        }
      ]
    };
  }
});

HistoryDemo.mount('#history-demo');

console.log('[ok] All demos loaded!');
console.log('Try the features:');
console.log('  1. Context auto-wiring');
console.log('  2. Reactive auto-rendering');
console.log('  3. Computed properties');
console.log('  4. Undo/Redo time-travel');

