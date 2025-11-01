/**
 * ScrollForge Ultimate Full-Stack Server
 * Shows ALL advanced backend features
 */

import { ScrollScriptServerUltimate } from '../../src/script/server-ultimate.js';

const server = new ScrollScriptServerUltimate({ debugMode: true });

// ===== Enable Dev Tools =====
server.dev({ 
  hotReload: true,
  watchPaths: ['./']
});

// ===== Enable CORS =====
server.enableCORS();

// ===== Signals =====
server.signal('users', [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
]);

server.signal('messages', []);

// ===== Middleware Lanes =====
server.before('logging', (req, res) => {
  console.log(`→ ${req.method} ${req.url}`);
});

server.after('timing', (req, res) => {
  console.log(`← ${res.statusCode} (completed)`);
});

server.errorBoundary((error, req, res) => {
  console.error('Error caught by boundary:', error);
  server.json(res, { error: 'Server error', message: error.message }, 500);
  return true; // Handled
});

// ===== Composable Routers =====
const apiRouter = server.createRouter('/api');

// Users routes
apiRouter.get('/users', (req, res) => {
  const users = server.get('users');
  server.json(res, { users });
});

apiRouter.get('/users/:id', (req, res) => {
  const users = server.get('users');
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (user) {
    server.json(res, { user });
  } else {
    server.json(res, { error: 'User not found' }, 404);
  }
});

// Action Pipeline Route
apiRouter.post('/users', server.pipeline()
  .guard((payload) => {
    // Check auth
    return payload.req.headers.authorization === 'Bearer valid-token';
  })
  .transform((payload) => ({
    ...payload,
    body: {
      ...payload.req.body,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
  }))
  .commit((payload, script) => {
    const users = script.get('users');
    const newUser = payload.body;
    script.set('users', [...users, newUser]);
    return newUser;
  })
  .effect((user) => {
    console.log(`[Effect] User created: ${user.name}`);
    // Could send email, log analytics, etc.
  })
  .build()
);

// Use API router
server.use(apiRouter);

// ===== WebSocket Channel =====
const chatChannel = server.channel('chat', {
  replayLimit: 50 // Replay last 50 messages
});

chatChannel.on('MESSAGE', (data, client) => {
  console.log(`[Chat] Message from client:`, data);
  
  // Add to messages
  const messages = server.get('messages');
  const newMessage = {
    id: Date.now(),
    text: data.text,
    user: data.user,
    timestamp: new Date().toISOString()
  };
  
  server.set('messages', [...messages, newMessage]);
  
  // Broadcast to all clients
  chatChannel.broadcast('MESSAGE', newMessage);
});

// ===== Collaboration =====
// Auto-sync users signal
server.watch('users', (users) => {
  server.collaboration.emit('default', 'USERS_UPDATED', users);
});

// ===== Auto-Sync Critical Signals =====
server.autoSync('users');
server.autoSync('messages');

// ===== Start Server =====
server.listen(3001, () => {
  console.log('\n[ok] ScrollScript Ultimate Server Ready!\n');
  console.log('Features enabled:');
  console.log('  ✅ Composable routers');
  console.log('  ✅ Middleware lanes (before/after/error)');
  console.log('  ✅ Action pipelines (guard → transform → commit → effect)');
  console.log('  ✅ WebSocket channels');
  console.log('  ✅ Presence tracking');
  console.log('  ✅ Message replay');
  console.log('  ✅ Auto signal sync');
  console.log('  ✅ Collaboration loop');
  console.log('  ✅ Dev tools (hot reload, trace)');
  console.log('  ✅ CORS');
  console.log('\nTry:');
  console.log('  GET  http://localhost:3001/api/users');
  console.log('  GET  http://localhost:3001/api/users/1');
  console.log('  POST http://localhost:3001/api/users');
  console.log('       (with Authorization: Bearer valid-token)');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await server.shutdown();
  process.exit(0);
});

