# 🔥 ScrollForge Chat Demo

**A clean, working example of Causal Graph Programming**

## Features

- ✅ Real-time WebSocket communication
- ✅ Auto-sync signals (Shared Variables Theory)
- ✅ Context auto-wiring (7 functions)
- ✅ Reactive styling with ScrollWeave
- ✅ No input refresh issues (uncontrolled inputs)
- ✅ Proper signal synchronization

## Run It

```bash
# Install dependencies
npm install

# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev

# Open browser
http://localhost:8081/index.html
```

## How It Works

### **Backend (server.js)**
- ScrollScript Server Ultimate on port 9000
- WebSocket channels for real-time messaging
- Auto-sync signals to all clients
- HTTP APIs for health, messages, users, stats

### **Frontend (app.js)**
- HTMLScrollMesh with 5 auto-wired functions
- Uncontrolled inputs (no refresh on typing!)
- Signal watchers sync global → component state
- ScrollWeave reactive styling

### **The Fix**

The key to making signals work with components:

```javascript
// Create global signals
app.Script.signal('connectionStatus', 'connecting');

// Component reads initially
() => ({
  connectionStatus: app.Script.get('connectionStatus')
})

// ✅ Watch signals and sync to component state!
app.Script.watch('connectionStatus', (status) => {
  ChatApp.state.connectionStatus = status;
  ChatApp._render();
});
```

**Without watchers**: Component state stays at initial value
**With watchers**: Component state updates when signals change ✨

## Architecture

```
User types message
    ↓
Events handler gets value from DOM
    ↓
Sends to server via WebSocket
    ↓
Server updates 'messages' signal
    ↓
Auto-sync broadcasts to all clients
    ↓
Client receives update
    ↓
Signal watcher fires
    ↓
Component state updates
    ↓
UI re-renders
    ↓
CAUSAL GRAPH PROGRAMMING! 🔥
```

## Paradigm: Causal Graph Programming

**Built on Shared Variables Theory**
- Global signals connect everything
- Single dispatcher routes all actions
- Explicit causal relationships
- Auto-managed propagation

---

🔥 **ScrollForge - The Future of Reactive Applications** 🔥

