/**
 * ScrollForge TodoMVC Example
 * Full-featured todo app demonstrating all three engines
 */

import ScrollForge from '../../src/index.js';

const app = new ScrollForge({ debugMode: true });

// ===== ScrollScript: State Management =====
app.Script.signal('todos', []);
app.Script.signal('filter', 'all'); // all, active, completed
app.Script.signal('newTodoText', '');

// Derived signals
app.Script.derived('filteredTodos', () => {
  const todos = app.Script.get('todos');
  const filter = app.Script.get('filter');
  
  if (filter === 'active') return todos.filter(t => !t.completed);
  if (filter === 'completed') return todos.filter(t => t.completed);
  return todos;
}, ['todos', 'filter']);

app.Script.derived('activeCount', () => {
  const todos = app.Script.get('todos');
  return todos.filter(t => !t.completed).length;
}, ['todos']);

app.Script.derived('completedCount', () => {
  const todos = app.Script.get('todos');
  return todos.filter(t => t.completed).length;
}, ['todos']);

// Actions
app.Script.action('ADD_TODO', () => {
  const text = app.Script.get('newTodoText').trim();
  if (!text) return;
  
  const todos = app.Script.get('todos');
  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
  };
  
  app.Script.set('todos', [...todos, newTodo]);
  app.Script.set('newTodoText', '');
});

app.Script.action('TOGGLE_TODO', (payload) => {
  const todos = app.Script.get('todos');
  const updated = todos.map(todo =>
    todo.id === payload.id ? { ...todo, completed: !todo.completed } : todo
  );
  app.Script.set('todos', updated);
});

app.Script.action('DELETE_TODO', (payload) => {
  const todos = app.Script.get('todos');
  app.Script.set('todos', todos.filter(t => t.id !== payload.id));
});

app.Script.action('CLEAR_COMPLETED', () => {
  const todos = app.Script.get('todos');
  app.Script.set('todos', todos.filter(t => !t.completed));
});

app.Script.action('SET_FILTER', (payload) => {
  app.Script.set('filter', payload.filter);
});

app.Script.action('UPDATE_INPUT', (payload) => {
  app.Script.set('newTodoText', payload.value);
});

// Persist todos to localStorage
app.Script.persist('todos');

// ===== ScrollMesh: Component Structure =====
app.Mesh.blueprint('Header', (props) => ({
  tag: 'div',
  attrs: { class: 'todo-header' },
  style: {
    padding: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  children: [
    {
      tag: 'h1',
      content: 'TodoMVC',
      style: {
        fontSize: '2.5rem',
        marginBottom: '1rem',
        textAlign: 'center',
      },
    },
    {
      tag: 'input',
      attrs: {
        type: 'text',
        placeholder: 'What needs to be done?',
        value: props.newTodoText,
        class: 'new-todo-input',
      },
      style: {
        width: '100%',
        padding: '1rem',
        fontSize: '1.1rem',
        border: 'none',
        borderRadius: '10px',
        outline: 'none',
      },
      events: {
        input: (e) => app.Script.trigger('UPDATE_INPUT', { value: e.target.value }),
        keydown: (e) => {
          if (e.key === 'Enter') {
            app.Script.trigger('ADD_TODO');
          }
        },
      },
    },
  ],
}));

app.Mesh.blueprint('TodoItem', (props) => ({
  tag: 'div',
  attrs: { class: `todo-item ${props.completed ? 'completed' : ''}` },
  style: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #eee',
    transition: 'all 0.3s ease',
  },
  children: [
    {
      tag: 'input',
      attrs: {
        type: 'checkbox',
        checked: props.completed,
      },
      style: {
        width: '20px',
        height: '20px',
        marginRight: '1rem',
        cursor: 'pointer',
      },
      events: {
        change: () => app.Script.trigger('TOGGLE_TODO', { id: props.id }),
      },
    },
    {
      tag: 'span',
      content: props.text,
      style: {
        flex: 1,
        fontSize: '1.1rem',
        textDecoration: props.completed ? 'line-through' : 'none',
        color: props.completed ? '#999' : '#333',
      },
    },
    {
      tag: 'button',
      content: '',
      attrs: { class: 'delete-btn' },
      style: {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        opacity: '0',
        transition: 'opacity 0.3s ease',
      },
      events: {
        click: () => app.Script.trigger('DELETE_TODO', { id: props.id }),
      },
    },
  ],
}));

app.Mesh.blueprint('TodoList', (props) => ({
  tag: 'div',
  attrs: { class: 'todo-list' },
  children: props.todos.length > 0
    ? props.todos.map(todo => app.Mesh.create('TodoItem', todo))
    : [{
        tag: 'p',
        content: 'No todos yet! Add one above.',
        style: {
          padding: '2rem',
          textAlign: 'center',
          color: '#999',
        },
      }],
}));

app.Mesh.blueprint('Footer', (props) => ({
  tag: 'div',
  attrs: { class: 'todo-footer' },
  style: {
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f9f9f9',
  },
  children: [
    {
      tag: 'span',
      content: `${props.activeCount} item${props.activeCount !== 1 ? 's' : ''} left`,
      style: { color: '#666' },
    },
    {
      tag: 'div',
      attrs: { class: 'filters' },
      style: { display: 'flex', gap: '0.5rem' },
      children: ['all', 'active', 'completed'].map(filter => ({
        tag: 'button',
        content: filter.charAt(0).toUpperCase() + filter.slice(1),
        attrs: { class: `filter-btn ${props.filter === filter ? 'active' : ''}` },
        style: {
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          background: props.filter === filter ? '#667eea' : 'transparent',
          color: props.filter === filter ? 'white' : '#666',
          fontWeight: props.filter === filter ? 'bold' : 'normal',
          transition: 'all 0.3s ease',
        },
        events: {
          click: () => app.Script.trigger('SET_FILTER', { filter }),
        },
      })),
    },
    {
      tag: 'button',
      content: 'Clear completed',
      attrs: { class: 'clear-btn' },
      style: {
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        background: props.completedCount > 0 ? '#ef4444' : '#eee',
        color: props.completedCount > 0 ? 'white' : '#999',
        opacity: props.completedCount > 0 ? '1' : '0.5',
        pointerEvents: props.completedCount > 0 ? 'auto' : 'none',
        transition: 'all 0.3s ease',
      },
      events: {
        click: () => app.Script.trigger('CLEAR_COMPLETED'),
      },
    },
  ],
}));

// Main connector
app.Mesh.connector('TodoApp', (context, mesh) => ({
  tag: 'div',
  attrs: { class: 'todo-app' },
  children: [
    mesh.create('Header', { newTodoText: context.newTodoText }),
    mesh.create('TodoList', { todos: context.filteredTodos }),
    mesh.create('Footer', {
      activeCount: context.activeCount,
      completedCount: context.completedCount,
      filter: context.filter,
    }),
  ],
}));

// ===== ScrollWeave: Reactive Styling =====
// Hover effects for todo items
document.addEventListener('mouseover', (e) => {
  if (e.target.closest('.todo-item')) {
    const item = e.target.closest('.todo-item');
    const deleteBtn = item.querySelector('.delete-btn');
    if (deleteBtn) {
      app.Weave.apply(deleteBtn, { opacity: '1' });
    }
    app.Weave.apply(item, { background: '#f9f9f9' });
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.closest('.todo-item')) {
    const item = e.target.closest('.todo-item');
    const deleteBtn = item.querySelector('.delete-btn');
    if (deleteBtn) {
      app.Weave.apply(deleteBtn, { opacity: '0' });
    }
    app.Weave.apply(item, { background: 'white' });
  }
});

// ===== Render Function =====
function render() {
  const todos = app.Script.get('todos');
  const filteredTodos = app.Script.get('filteredTodos');
  const filter = app.Script.get('filter');
  const newTodoText = app.Script.get('newTodoText');
  const activeCount = app.Script.get('activeCount');
  const completedCount = app.Script.get('completedCount');

  const todoApp = app.Mesh.assemble('TodoApp', {
    todos,
    filteredTodos,
    filter,
    newTodoText,
    activeCount,
    completedCount,
  });

  app.Mesh.render(todoApp, '#app');
}

// Watch signals and re-render
app.Script.watch('todos', render);
app.Script.watch('filter', render);
app.Script.watch('newTodoText', render);

// Initial render
render();

console.log('TodoMVC loaded!');
console.log('Try adding some todos!');

