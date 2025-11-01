/**
 * ScrollForge Full-Stack Demo - Server
 * Shows ScrollScript Server with all advanced features
 */

import { ScrollScriptServerAdvanced } from '../../src/script/server-advanced.js';

const server = new ScrollScriptServerAdvanced({ debugMode: true });

// ===== Signals (Server State) =====
server.signal('users', [
  { id: 1, name: 'John', email: 'john@example.com', active: true },
  { id: 2, name: 'Jane', email: 'jane@example.com', active: false },
  { id: 3, name: 'Bob', email: 'bob@example.com', active: true }
]);

server.signal('stats', {
  totalRequests: 0,
  activeUsers: 2
});

// ===== Enable Features =====
server.enableCORS({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  headers: 'Content-Type,Authorization'
});

server.useSession({ cookieName: 'scrollforge_sid' });

// ===== Middleware =====
server.use((req, res) => {
  // Log requests
  console.log(`${req.method} ${req.url}`);
  
  // Increment stats
  const stats = server.get('stats');
  server.set('stats', {
    ...stats,
    totalRequests: stats.totalRequests + 1
  });
});

// ===== Routes with Params =====

// Get all users
server.get('/api/users', 'FETCH_USERS', (req, res) => {
  const users = server.get('users');
  server.json(res, { users });
});

// Get user by ID (with :params!)
server.get('/api/users/:id', 'FETCH_USER', (req, res) => {
  const users = server.get('users');
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (user) {
    server.json(res, { user });
  } else {
    server.json(res, { error: 'User not found' }, 404);
  }
});

// Create user (with validation!)
server.post('/api/users', 'CREATE_USER', async (req, res) => {
  // Validate
  const validator = server.validate({
    name: { required: true, type: 'string' },
    email: { required: true, pattern: /\S+@\S+\.\S+/ }
  });
  
  if (!validator(req, res)) return;
  
  // Create user
  const users = server.get('users');
  const newUser = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
    active: true
  };
  
  server.set('users', [...users, newUser]);
  // Auto-syncs to all clients! ✨
  
  server.json(res, { user: newUser }, 201);
});

// Update user
server.put('/api/users/:id', 'UPDATE_USER', (req, res) => {
  const users = server.get('users');
  const id = parseInt(req.params.id);
  const updated = users.map(u => 
    u.id === id ? { ...u, ...req.body } : u
  );
  
  server.set('users', updated);
  // Auto-syncs! ✨
  
  server.json(res, { success: true });
});

// Delete user
server.delete('/api/users/:id', 'DELETE_USER', (req, res) => {
  const users = server.get('users');
  const id = parseInt(req.params.id);
  
  server.set('users', users.filter(u => u.id !== id));
  // Auto-syncs! ✨
  
  server.json(res, { success: true });
});

// Get stats
server.get('/api/stats', 'FETCH_STATS', (req, res) => {
  const stats = server.get('stats');
  server.json(res, { stats });
});

// ===== Rate Limiting =====
server.rateLimit('/api/users', 10, 60000); // 10 requests per minute

// ===== Auto-Sync Signals to Clients =====
server.autoSync('users'); // Any change broadcasts to all clients!
server.autoSync('stats');

// ===== Start Server =====
server.listen(3001, () => {
  console.log('[ok] ScrollScript Server ready!');
  console.log('Features enabled:');
  console.log('  - Route params (/users/:id)');
  console.log('  - Auto body parsing');
  console.log('  - CORS enabled');
  console.log('  - Sessions');
  console.log('  - Rate limiting');
  console.log('  - Auto signal sync to clients');
  console.log('  - Validation');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await server.shutdown();
  process.exit(0);
});

