# 🔧 ScrollForge Bug Fixes - v0.1.1

## Critical Bugs Fixed

### 1. ✅ **Batched Updates - Old Value Tracking**
**File:** `src/script/core.js:301`

**Problem:** Watchers received `(value, value)` instead of `(newValue, oldValue)` in batched mode.

**Fix:** Store `_oldValue` on signal before batching, pass correct values to listeners.

```javascript
// Before
listener(value, value); // ❌ Both same

// After  
listener(newValue, oldValue); // ✅ Correct
```

---

### 2. ✅ **Event Extractor - Undefined Handling**
**File:** `src/script/client.js:30-62`

**Problem:** Actions fired even when payload extractor returned `undefined`.

**Fix:** Only trigger action if extractor returns a defined value.

```javascript
// Before
const payload = payloadExtractor(e);
this.trigger(actionType, payload); // ❌ Always fires

// After
const payload = payloadExtractor(e);
if (payload !== undefined) {  // ✅ Check first
  this.trigger(actionType, payload);
}
```

---

### 3. ✅ **Keyboard Handler - Direct Trigger**
**File:** `src/script/client.js:61`

**Problem:** `onKey()` used generic `on()` which could fire on wrong keys.

**Fix:** Dedicated handler that only triggers on exact key match.

```javascript
// Before
return this.on(document.body, 'keydown', actionType, (e) => {
  if (e.key === key) return payload; // ❌ Still fires action
});

// After
const handler = (e) => {
  if (e.key === key) {
    this.trigger(actionType, payload); // ✅ Direct trigger only on match
  }
};
```

---

### 4. ✅ **Event Cleanup - Wildcard Bug**
**File:** `src/script/client.js:357`

**Problem:** Used literal `'*'` event name, leaving actual handlers attached.

**Fix:** Use correct event name from Map key.

```javascript
// Before
el.removeEventListener('*', handler); // ❌ Wrong event name

// After
el.removeEventListener(eventName, handler); // ✅ Correct event name
```

---

### 5. ✅ **Style Application - Property Name Bug**
**File:** `src/weave/core.js:89`

**Problem:** Computed kebab-case but wrote with camelCase property name.

**Fix:** Use camelCase directly (el.style handles conversion).

```javascript
// Before
const cssProp = this._camelToKebab(prop);
el.style[prop] = value; // ❌ cssProp computed but not used

// After
el.style[prop] = value; // ✅ Use camelCase directly
```

---

### 6. ✅ **DOM Attributes - Props Pollution**
**File:** `src/mesh/core.js:143`

**Problem:** Spread all props into DOM attributes, coercing objects to strings.

**Fix:** Only set primitive values as attributes.

```javascript
// Before
Object.entries({ ...attrs, ...props }).forEach(([key, value]) => {
  el.setAttribute(key, value); // ❌ Sets everything
});

// After
Object.entries(attrs).forEach(([key, value]) => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    el.setAttribute(key, value); // ✅ Only primitives
  }
});
```

---

### 7. ✅ **Top-Level Await - CommonJS Break**
**File:** `src/script/index.js:18`

**Problem:** `await import()` breaks CommonJS build.

**Fix:** Use static imports with ternary.

```javascript
// Before
if (typeof window !== 'undefined') {
  const { ScrollScriptClient } = await import('./client.js'); // ❌ Breaks CJS
}

// After
import { ScrollScriptClient } from './client.js';
import { ScrollScriptServer } from './server.js';
const ScrollScript = typeof window !== 'undefined' ? ScrollScriptClient : ScrollScriptServer; // ✅ Works
```

---

### 8. ✅ **CLI - require() in ES Module**
**File:** `cli/commands/dev.js:69`

**Problem:** `require('child_process')` in ES module throws.

**Fix:** Use ES6 import.

```javascript
// Before
require('child_process').exec(...); // ❌ Throws in ES module

// After
import { exec } from 'child_process';
exec(...); // ✅ Works
```

---

### 9. ✅ **IntersectionObserver - Memory Leak**
**File:** `src/script/client.js:333`

**Problem:** Observers created but never stored for cleanup.

**Fix:** Push to `domObservers` array.

```javascript
// Before
const observer = new IntersectionObserver(...);
// ❌ Not stored, leaks on cleanup

// After
const observer = new IntersectionObserver(...);
this.domObservers.push(observer); // ✅ Stored for cleanup
```

---

## Testing Checklist

- [x] Batched updates preserve old values
- [x] Key handlers only fire on correct key
- [x] Event extractors respect undefined
- [x] Event cleanup removes correct listeners
- [x] Styles apply with camelCase properties
- [x] DOM attributes only get primitives
- [x] CommonJS build works
- [x] CLI exec works in ES module
- [x] IntersectionObservers clean up properly

---

## Version

**v0.1.1** - Bug fix release

---

🔥 **All critical bugs fixed!** 🔥

