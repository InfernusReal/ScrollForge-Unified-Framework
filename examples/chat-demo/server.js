/**
 * ScrollForge Chat Server
 * Clean backend for the chat demo
 */

import { ScrollScriptServerUltimate } from 'scrollforge/script';

console.log('🔥 ScrollForge Chat Server Starting...');

const server = new ScrollScriptServerUltimate({ 
  debugMode: true 
});

// Enable CORS
server.enableCORS({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  headers: 'Content-Type,Authorization'
});

console.log('✅ CORS enabled');

// Signals
server.signal('messages', []);
server.signal('users', []);
server.signal('onlineCount', 0);

// Auto-sync to clients
server.autoSync('messages');
server.autoSync('users');
server.autoSync('onlineCount');

console.log('✅ Signals created and auto-sync enabled');

// WebSocket Channel
const chat = server.channel('chat', {
  replayLimit: 50
});

console.log('✅ Chat channel created');

// Handle user join
chat.on('USER_JOIN', (data, client) => {
  console.log(`👤 ${data.username} joined`);
  
  const users = server.get('users') || [];
  const newUser = {
    id: client.id,
    username: data.username,
    joinedAt: new Date().toISOString()
  };
  
  server.set('users', [...users, newUser]);
  server.set('onlineCount', users.length + 1);
  
  // Welcome message
  const messages = server.get('messages') || [];
  const welcomeMsg = {
    id: Date.now(),
    username: 'System',
    text: `${data.username} joined the chat!`,
    timestamp: new Date().toISOString(),
    isSystem: true
  };
  
  server.set('messages', [...messages, welcomeMsg]);
  
  chat.broadcast('USER_JOINED', {
    user: newUser,
    message: welcomeMsg
  });
});

// Handle messages
chat.on('SEND_MESSAGE', (data, client) => {
  console.log(`💬 ${data.username}: ${data.text}`);
  
  const messages = server.get('messages') || [];
  const newMessage = {
    id: Date.now(),
    username: data.username,
    text: data.text,
    timestamp: new Date().toISOString()
  };
  
  server.set('messages', [...messages, newMessage]);
  
  chat.broadcast('NEW_MESSAGE', {
    message: newMessage
  });
});

// HTTP Routes
server.get('/api/health', (req, res) => {
  server.json(res, {
    status: 'SCROLLFORGE POWERED! 🔥',
    paradigm: 'Causal Graph Programming',
    uptime: process.uptime()
  });
});

server.get('/api/messages', (req, res) => {
  const messages = server.get('messages') || [];
  server.json(res, { messages });
});

server.get('/api/users', (req, res) => {
  const users = server.get('users') || [];
  server.json(res, { users });
});

server.get('/api/stats', (req, res) => {
  const messages = server.get('messages') || [];
  const users = server.get('users') || [];
  
  server.json(res, {
    totalMessages: messages.length,
    onlineUsers: users.length,
    paradigm: 'Causal Graph Programming'
  });
});

// Start server
const PORT = 9000;

server.listen(PORT, () => {
  console.log(`
🔥 SCROLLFORGE CHAT SERVER READY! 🔥

🌐 HTTP:      http://localhost:${PORT}
💬 WebSocket: ws://localhost:${PORT}/ws
🛠️ Health:    http://localhost:${PORT}/api/health

Features:
✅ Real-time WebSocket channels
✅ Auto-sync signals
✅ Causal Graph Programming
✅ Shared Variables Theory

Ready to chat! 🚀
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

export default server;

