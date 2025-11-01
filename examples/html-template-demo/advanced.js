/**
 * ScrollForge Advanced HTML Integration
 * Shows ALL the different ways to use ScrollMesh
 */

import ScrollForge from '../../src/index.js';
import { HTMLScrollMesh } from '../../src/mesh/html-context.js';
import { ScrollMesh } from '../../src/mesh/context.js';

window.app = new ScrollForge({ debugMode: true });

console.log('== Advanced HTML Integration Demo ==\n');

// ===== DEMO 1: Pure HTML Template Mode =====
console.log('[1] HTML Template Mode');

const Demo1 = HTMLScrollMesh(
  // HTML function - template literal
  ({ count }) => `
    <div style="text-align: center;">
      <div style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">
        ${count}
      </div>
      <button class="btn-html">Click (HTML Mode)</button>
    </div>
  `,
  
  // Weave function - dynamic styling
  (state, weave) => {
    weave.apply('.btn-html', {
      padding: '0.5rem 1rem',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    });
    
    weave.when('.btn-html',
      state.count > 3,
      { background: 'green' },
      { background: '#667eea' }
    );
  },
  
  // Logic
  (events, state) => {
    events.on('click', '.btn-html', () => {
      state.count++;
    });
  },
  
  // State
  () => ({ count: 0 })
);

Demo1.mount('#demo1');

// ===== DEMO 2: Pure JavaScript Object Mode =====
console.log('[2] JavaScript Object Mode');

const Demo2 = ScrollMesh(
  // JavaScript object (original ScrollMesh way)
  ({ count }) => ({
    tag: 'div',
    style: { textAlign: 'center' },
    children: [
      {
        tag: 'div',
        style: { fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' },
        content: count.toString()
      },
      {
        tag: 'button',
        attrs: { class: 'btn-js' },
        content: 'Click (JS Mode)',
        style: {
          padding: '0.5rem 1rem',
          background: '#764ba2',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }
      }
    ]
  }),
  
  // Logic
  (events, state) => {
    events.on('click', '.btn-js', () => {
      state.count++;
    });
  },
  
  // State
  () => ({ count: 0 })
);

Demo2.mount('#demo2');

// ===== DEMO 3: Mixed Mode (HTML + JS together) =====
console.log('[3] Mixed HTML + JS Mode');

const Demo3 = HTMLScrollMesh(
  // Can return EITHER HTML string OR JS object!
  ({ count, useHTML }) => {
    if (useHTML) {
      // HTML mode
      return `
        <div style="text-align: center;">
          <div style="font-size: 2rem; margin: 1rem 0;">HTML: ${count}</div>
          <button class="toggle-mode">Switch to JS</button>
        </div>
      `;
    } else {
      // JS mode
      return {
        tag: 'div',
        style: { textAlign: 'center' },
        children: [
          {
            tag: 'div',
            style: { fontSize: '2rem', margin: '1rem 0' },
            content: `JS: ${count}`
          },
          {
            tag: 'button',
            attrs: { class: 'toggle-mode' },
            content: 'Switch to HTML'
          }
        ]
      };
    }
  },
  
  // Logic
  (events, state) => {
    events.on('click', '.toggle-mode', () => {
      state.useHTML = !state.useHTML;
      state.count++;
    });
  },
  
  // State
  () => ({ 
    count: 0,
    useHTML: true
  })
);

Demo3.mount('#demo3');

setTimeout(() => {
  window.app.Weave.apply('.toggle-mode', {
    padding: '0.5rem 1rem',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  });
}, 100);

// ===== DEMO 4: HTML + Full ScrollWeave Integration =====
console.log('[4] HTML + ScrollWeave Mode');

const Demo4 = HTMLScrollMesh(
  // HTML template
  ({ count, isActive }) => `
    <div style="text-align: center;">
      <div class="reactive-box" style="
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        font-weight: bold;
        transition: all 0.3s ease;
      ">
        ${isActive ? 'ACTIVE' : 'INACTIVE'}: ${count}
      </div>
      <button class="activate-btn">Toggle Active</button>
      <button class="count-btn">Count +1</button>
    </div>
  `,
  
  // ScrollWeave - dynamic styling based on state!
  (state, weave) => {
    // Conditional styling
    weave.when('.reactive-box',
      state.isActive,
      { 
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        transform: 'scale(1.05)',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
      },
      { 
        background: '#e5e7eb',
        color: '#666',
        transform: 'scale(1)',
        boxShadow: 'none'
      }
    );

    // Animate on count change
    if (state._lastCount !== state.count) {
      weave.animate('.reactive-box', [
        { transform: 'scale(1.1)' },
        { transform: state.isActive ? 'scale(1.05)' : 'scale(1)' }
      ], { duration: 200 });
      state._lastCount = state.count;
    }
  },
  
  // Logic
  (events, state) => {
    events.on('click', '.activate-btn', () => {
      state.isActive = !state.isActive;
    });
    
    events.on('click', '.count-btn', () => {
      state.count++;
    });
  },
  
  // State
  () => ({ 
    count: 0,
    isActive: false,
    _lastCount: 0
  })
);

Demo4.mount('#demo4');

setTimeout(() => {
  window.app.Weave.apply('button', {
    padding: '0.5rem 1rem',
    margin: '0.25rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  });

  window.app.Weave.apply('.activate-btn', {
    background: '#10b981'
  });
}, 100);

console.log('\n[ok] All demos loaded!');
console.log('\nFeatures shown:');
console.log('  1. HTML template strings with ${state}');
console.log('  2. JavaScript object mode (original)');
console.log('  3. Mixed mode (switch between HTML/JS)');
console.log('  4. HTML + ScrollWeave dynamic styling');
console.log('\nScrollMesh is now FULLY FLEXIBLE!');

