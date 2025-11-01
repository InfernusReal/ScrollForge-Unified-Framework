# Changelog

All notable changes to ScrollForge will be documented in this file.

---

## [0.3.0] - 2025-10-31

### 🚀 Major Release - Ultimate Full-Stack

**Complete backend overhaul - beyond Express + Socket.io!**

#### Backend Features
- ✅ **Composable Routers** - Nested routing, wildcards, route params
- ✅ **Middleware Lanes** - Before/after hooks, error boundaries, per-route middleware
- ✅ **WebSocket Channels** - Broadcast, presence tracking, message replay (50 messages)
- ✅ **Action Pipelines** - Guard → Transform → Commit → Effect flow
- ✅ **Dev Tools** - Hot reload, request tracing, test simulation
- ✅ **3 Server Runtimes** - Basic, Advanced, Ultimate

#### Frontend Features
- ✅ **ForgeFetch** - Advanced HTTP client (retry, exponential backoff, cancellation, caching, optimistic updates)
- ✅ **Net Hub** - Network state signals (net.status, net.loading, net.latency, net.requests, net.errors)
- ✅ **Request Helpers** - useRequest hook, RequestBoundary, defer states, subscriptions
- ✅ **Network Reactivity** - Auto-grayscale on offline, loading animations, error shake
- ✅ **Collaboration Loop** - Server emit → client auto-dispatch → Mesh rerender

#### Bug Fixes (Codex Review)
- Fixed optimistic create scope bug
- Fixed recursive delete (stack overflow)
- Fixed cache poisoning (method-specific keys)
- Fixed cancel token memory leak
- Fixed missing response.config
- Fixed net.requests infinite growth
- Fixed regex escaping vulnerability
- Fixed hardcoded localhost WebSocket URL
- Fixed one-way collaborative signal sync
- Fixed dead perRoute middleware

#### Integration
- Complete flow: Backend → ForgeFetch → ScrollScript → ScrollWeave → ScrollMesh
- Real-time collaboration across all clients
- Automatic animations on network events
- Production-ready deployment

**Files added:** 12 core modules, 3 example files  
**Lines added:** ~2,455 lines  
**Total features:** 37+  

See [ULTIMATE_FEATURES.md](./ULTIMATE_FEATURES.md) for complete documentation.

---

## [0.2.0] - 2025-10-31

(Previous v0.2.0 content...)

---

## [0.1.1] - 2025-10-31

### 🐛 Bug Fixes

#### Core Fixes
- **Batched updates** now correctly pass `(newValue, oldValue)` to watchers instead of `(value, value)`
- **Event extractors** only trigger actions when returning defined values (not undefined)
- **Keyboard handlers** (`onKey`) now use dedicated logic instead of generic `on()` helper
- **Event cleanup** uses correct event names instead of literal `'*'`

#### Engine Fixes
- **ScrollWeave** style application now uses camelCase properties correctly
- **ScrollMesh** only sets primitive values as DOM attributes, keeping component props in logic
- **IntersectionObserver** instances now properly stored and cleaned up

#### Build & CLI Fixes
- Removed top-level `await` that broke CommonJS builds
- Fixed `require()` usage in ES modules (CLI dev command)

See [BUGFIXES.md](./BUGFIXES.md) for detailed technical explanations.

---

## [0.1.0] - 2025-10-31

### 🎉 Initial Release

The first public release of ScrollForge - The Unified Reactive Framework!

### ✨ Features

#### ScrollScript Engine
- Universal data flow orchestration (client + server)
- Signal system with reactive updates
- Action dispatcher with pipeline support
- Time-travel debugging and undo/redo
- Derived signals with automatic dependency tracking
- Batched updates for performance
- Client-side event bindings (click, keyboard, scroll, etc.)
- Server-side HTTP routing and middleware
- LocalStorage persistence
- Cross-tab synchronization
- Debounce and throttle helpers

#### ScrollWeave Engine
- Logic-reactive styling system
- Direct style application
- Conditional styling (if-then-else logic)
- Multiple condition support (switch-like)
- Animation system (fade, slide, scale)
- Spring physics animations
- Custom Web Animations API support
- Design token system
- Theme support
- Responsive helpers
- GPU-accelerated transforms

#### ScrollMesh Engine
- Blueprint-based component system
- Recursive component rendering
- Connector topology pattern
- Nested component support
- Event binding
- Virtual list rendering for large datasets
- Portal support
- Fragment support
- Helper functions (repeat, when, fragment)

#### Integration Layer
- Unified ScrollForge class
- Automatic signal-to-style bindings
- Automatic signal-to-component bindings
- Seamless cooperation between all three engines

#### CLI Tools
- `sf create` - Project scaffolding with templates
- `sf dev` - Development server
- `sf build` - Production build with minification
- Three project templates (basic, counter, scroll)

#### Examples
- Counter - Basic reactive counter
- Scroll Navigator - Scroll-driven section navigation
- TodoMVC - Full todo application

#### Documentation
- Comprehensive README with full API reference
- Getting Started tutorial
- Quick Reference cheat sheet
- Contributing guidelines
- Project summary

### 🏗️ Architecture

- Pure JavaScript (ES6+) implementation
- Modular design with three independent engines
- Zero dependencies (except CLI uses commander)
- Works in browser and Node.js
- Rollup-based build system

### 📦 Package

- Published as `scrollforge` on npm
- ESM and CommonJS support
- CLI tools included (`sf` command)
- Source maps for debugging

---

## [Unreleased]

### Planned Features
- TypeScript definitions
- React/Vue/Svelte bridges
- SSR/SSG support
- WebSocket client-server sync
- DevTools browser extension
- Visual graph debugger
- Plugin system
- Canvas/WebGL adapters
- Mobile (React Native) bridge
- Performance benchmarks

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backwards-compatible)
- **PATCH** version for backwards-compatible bug fixes

---

## Links

- [Repository](https://github.com/scrollforge/scrollforge)
- [Issues](https://github.com/scrollforge/scrollforge/issues)
- [Documentation](./README.md)

---

🔥 **Built by IA-Labs | Inherited Alteration Systems** 🔥

