/**
 * Todo App Built with ScrollForge!
 * Using the REAL framework now! 🔥
 */

console.log('=== SCROLLFORGE TODO APP ===');
console.log('Importing browser-safe builds...\n');

import { ScrollScriptClient } from '../dist/client.browser.js';
import { ScrollWeaveCore } from '../dist/weave-core.browser.js';
import { HTMLScrollMesh } from '../dist/mesh-full.browser.js';

console.log('✅ Imports successful!');
console.log('Creating app...\n');

// Create ScrollForge manually for browser
window.app = {
  Script: new ScrollScriptClient({ debugMode: true }),
  Weave: new ScrollWeaveCore({ debugMode: true })
};

console.log('✅ ScrollForge initialized for browser!');

const TodoApp = HTMLScrollMesh(
  // FUNCTION 1: HTML Template
  ({ todos, filter, activeTab }) => `
    <div class="todo-app">
      <!-- NAVBAR -->
      <nav class="navbar" style="
        background: linear-gradient(135deg, #667eea, #764ba2);
        margin: -2rem -2rem 2rem -2rem;
        padding: 1.5rem 2rem;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1 style="color: white; margin: 0; font-size: 1.8rem;">
            📝 ScrollForge Todo
          </h1>
          <div class="nav-tabs" style="display: flex; gap: 1rem;">
            <button class="nav-tab ${activeTab === 'todos' ? 'active' : ''}" data-tab="todos" style="
              padding: 0.5rem 1.5rem;
              border: 2px solid white;
              border-radius: 8px;
              background: ${activeTab === 'todos' ? 'white' : 'transparent'};
              color: ${activeTab === 'todos' ? '#667eea' : 'white'};
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
            ">
              Todos
            </button>
            <button class="nav-tab ${activeTab === 'stats' ? 'active' : ''}" data-tab="stats" style="
              padding: 0.5rem 1.5rem;
              border: 2px solid white;
              border-radius: 8px;
              background: ${activeTab === 'stats' ? 'white' : 'transparent'};
              color: ${activeTab === 'stats' ? '#667eea' : 'white'};
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
            ">
              Stats
            </button>
            <button class="nav-tab ${activeTab === 'about' ? 'active' : ''}" data-tab="about" style="
              padding: 0.5rem 1.5rem;
              border: 2px solid white;
              border-radius: 8px;
              background: ${activeTab === 'about' ? 'white' : 'transparent'};
              color: ${activeTab === 'about' ? '#667eea' : 'white'};
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
            ">
              About
            </button>
          </div>
        </div>
      </nav>
      
      <!-- TAB CONTENT -->
      ${activeTab === 'todos' ? `
        <!-- TODOS TAB -->
        <div class="tab-content">
          <p style="text-align: center; color: #666; margin-bottom: 2rem; font-size: 0.9rem;">
            Built with Causal Graph Programming! ✨
          </p>
      
      <input 
        class="new-todo-input"
        type="text"
        placeholder="What needs to be done?"
        style="
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          border: 2px solid #ddd;
          border-radius: 10px;
          outline: none;
          margin-bottom: 2rem;
        "
      />
      
      <div class="todo-list">
        ${todos.length === 0 ? `
          <p style="text-align: center; color: #999; padding: 2rem;">
            No todos yet! Type above and press Enter 👆
          </p>
        ` : todos
          .filter(t => {
            if (filter === 'active') return !t.completed;
            if (filter === 'completed') return t.completed;
            return true;
          })
          .map(t => `
            <div class="todo-item" data-id="${t.id}">
              <input 
                type="checkbox" 
                ${t.completed ? 'checked' : ''}
                data-id="${t.id}"
                class="todo-checkbox"
              />
              <span class="${t.completed ? 'completed' : ''}">
                ${t.text}
              </span>
              <button class="delete-btn" data-id="${t.id}">Delete</button>
            </div>
          `).join('')}
      </div>
      
      <div class="filters">
        <button data-filter="all" class="${filter === 'all' ? 'active' : ''}">
          All (${todos.length})
        </button>
        <button data-filter="active" class="${filter === 'active' ? 'active' : ''}">
          Active (${todos.filter(t => !t.completed).length})
        </button>
        <button data-filter="completed" class="${filter === 'completed' ? 'active' : ''}">
          Completed (${todos.filter(t => t.completed).length})
        </button>
      </div>
    </div>
  ` : activeTab === 'stats' ? `
    <!-- STATS TAB -->
    <div class="tab-content">
      <h2 style="color: #667eea; margin-bottom: 2rem;">📊 Statistics</h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem;">
        <div class="stat-card" style="
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        ">
          <div style="font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem;">
            ${todos.length}
          </div>
          <div style="font-size: 0.9rem; opacity: 0.9;">
            Total Todos
          </div>
        </div>
        
        <div class="stat-card" style="
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        ">
          <div style="font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem;">
            ${todos.filter(t => t.completed).length}
          </div>
          <div style="font-size: 0.9rem; opacity: 0.9;">
            Completed
          </div>
        </div>
        
        <div class="stat-card" style="
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        ">
          <div style="font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem;">
            ${todos.filter(t => !t.completed).length}
          </div>
          <div style="font-size: 0.9rem; opacity: 0.9;">
            Active
          </div>
        </div>
      </div>
      
      <div style="margin-top: 2rem; padding: 1.5rem; background: #f9f9f9; border-radius: 10px;">
        <h3 style="color: #667eea; margin-bottom: 1rem;">Completion Rate</h3>
        <div style="
          width: 100%;
          height: 30px;
          background: #e5e7eb;
          border-radius: 15px;
          overflow: hidden;
        ">
          <div style="
            width: ${todos.length > 0 ? (todos.filter(t => t.completed).length / todos.length * 100) : 0}%;
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.9rem;
          ">
            ${todos.length > 0 ? Math.round(todos.filter(t => t.completed).length / todos.length * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  ` : `
    <!-- ABOUT TAB -->
    <div class="tab-content">
      <h2 style="color: #667eea; margin-bottom: 2rem;">🔥 About ScrollForge</h2>
      
      <div style="line-height: 1.8; color: #333;">
        <p style="margin-bottom: 1rem;">
          <strong>ScrollForge</strong> is a full-stack reactive framework built on a new programming paradigm called <strong>Causal Graph Programming</strong>.
        </p>
        
        <p style="margin-bottom: 1rem;">
          This todo app demonstrates:
        </p>
        
        <ul style="margin-left: 2rem; margin-bottom: 1rem;">
          <li>📝 <strong>HTMLScrollMesh</strong> - HTML template rendering</li>
          <li>⚡ <strong>Auto-wiring</strong> - ${activeTab === 'about' ? '5' : '5'} functions auto-connected</li>
          <li>🎨 <strong>ScrollWeave</strong> - Reactive styling & animations</li>
          <li>💾 <strong>Persistence</strong> - localStorage integration</li>
          <li>🔄 <strong>Reactive updates</strong> - State changes = instant UI updates</li>
        </ul>
        
        <p style="margin-bottom: 1rem;">
          <strong>Built in one night.</strong> By a 16-year-old. Using AI. Sponsored by Mantu.
        </p>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: #f0f4ff; border-left: 4px solid #667eea; border-radius: 5px;">
          <p style="margin: 0; color: #667eea; font-weight: 600;">
            ✨ Causal Graph Programming = Events cause state. State causes effects. Framework manages the graph.
          </p>
        </div>
        
        <div style="margin-top: 1.5rem; text-align: center;">
          <a href="https://github.com/InfernusReal/ScrollForge-Unified-Framework" 
             target="_blank"
             style="
               display: inline-block;
               padding: 1rem 2rem;
               background: #667eea;
               color: white;
               text-decoration: none;
               border-radius: 10px;
               font-weight: 600;
               transition: all 0.3s ease;
             "
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </div>
  `}
    </div>
  `,
  
  // FUNCTION 2: ScrollWeave Styling
  (state, weave) => {
    console.log('Applying styles...');
    
    weave.apply('.todo-item', {
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      marginBottom: '0.5rem',
      background: '#f9f9f9',
      borderRadius: '10px',
      gap: '1rem'
    });
    
    weave.apply('.todo-item span', {
      flex: '1',
      fontSize: '1.1rem'
    });
    
    weave.apply('.todo-item span.completed', {
      textDecoration: 'line-through',
      color: '#999'
    });
    
    weave.apply('.todo-checkbox', {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    });
    
    weave.apply('.delete-btn', {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: '600'
    });
    
    weave.apply('.filters', {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '2px solid #eee'
    });
    
    weave.apply('.filters button', {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      background: '#e5e7eb',
      color: '#666'
    });
    
    weave.apply('.filters button.active', {
      background: '#667eea',
      color: 'white'
    });
    
    // Navbar hover effects
    weave.on('.nav-tab', 'mouseenter', {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    });
    
    weave.on('.nav-tab', 'mouseleave', {
      transform: 'translateY(0)',
      boxShadow: 'none'
    });
    
    // Stat cards animation
    weave.apply('.stat-card', {
      transform: 'scale(1)',
      transition: 'transform 0.3s ease'
    });
    
    weave.on('.stat-card', 'mouseenter', {
      transform: 'scale(1.05)'
    });
    
    weave.on('.stat-card', 'mouseleave', {
      transform: 'scale(1)'
    });
  },
  
  // FUNCTION 3: Logic
  (events, state) => {
    console.log('Binding events...');
    
    events.on('keydown', '.new-todo-input', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        console.log('✅ Adding todo:', e.target.value.trim());
        
        state.todos = [...state.todos, {
          id: Date.now(),
          text: e.target.value.trim(),
          completed: false
        }];
        
        // Clear input directly (don't update state to avoid re-render)
        e.target.value = '';
      }
    });
    
    // Don't track input value in state (causes re-render on every keystroke!)
    // Just use the DOM value directly
    
    events.on('change', '.todo-checkbox', (e) => {
      const id = parseInt(e.target.dataset.id);
      console.log('✅ Toggled todo:', id);
      
      state.todos = state.todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
    });
    
    events.on('click', '.delete-btn', (e) => {
      const id = parseInt(e.target.dataset.id);
      console.log('🗑️ Deleted todo:', id);
      
      state.todos = state.todos.filter(t => t.id !== id);
    });
    
    events.on('click', '[data-filter]', (e) => {
      state.filter = e.target.dataset.filter;
      console.log('🔍 Filter:', state.filter);
    });
    
    // Nav tab switching
    events.on('click', '.nav-tab', (e) => {
      state.activeTab = e.target.dataset.tab;
      console.log('📑 Tab:', state.activeTab);
    });
  },
  
  // FUNCTION 4: State (Load from localStorage immediately!)
  () => {
    // Load saved todos synchronously
    const saved = localStorage.getItem('scrollforge-todos');
    const todos = saved ? JSON.parse(saved) : [];
    
    if (todos.length > 0) {
      console.log('📂 Loaded saved todos:', todos.length);
    }
    
    return {
      todos: todos,
      filter: 'all',
      activeTab: 'todos'  // Default tab
    };
  },
  
  // FUNCTION 5: Effects (Auto-save)
  (state, effects) => {
    effects.when('todos', (todos) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('scrollforge-todos', JSON.stringify(todos));
        console.log('💾 Auto-saved:', todos.length, 'todos');
      }
    });
  }
);

console.log('Mounting app...');
TodoApp.mount('#app');

console.log('\n🔥 ScrollForge Todo App Ready!');
console.log('Using the REAL framework with 6 auto-wired functions!\n');
