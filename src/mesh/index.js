/**
 * ScrollMesh - Recursive Component Assembly
 * 
 * "Messy backend, clean frontend"
 * Connector topology for organized chaos
 */

export { ScrollMeshCore } from './core.js';
export { ReactiveComponent } from './reactive.js';
export { ScrollMesh, ScrollMeshContext } from './context.js';
export { HTMLScrollMesh, HTMLScrollMeshContext } from './html-context.js';
export { HTMLParser, globalParser } from './html-parser.js';
export { RenderScheduler, TimeSlicedComponent, globalScheduler } from './scheduler.js';
export { VisualDebugger, globalDebugger } from './visual-debug.js';

// Export default instance for convenience
import { ScrollMeshCore } from './core.js';
import { ReactiveComponent } from './reactive.js';
import { ScrollMesh as ScrollMeshFn } from './context.js';
import { globalScheduler } from './scheduler.js';
import { globalDebugger } from './visual-debug.js';

const ScrollMeshInstance = new ScrollMeshCore();

// Add reactive component method
ScrollMeshInstance.component = function(name, config) {
  return new ReactiveComponent(name, config);
};

// Add context method (the new ScrollMesh function)
ScrollMeshInstance.context = ScrollMeshFn;

// Add scheduler access
ScrollMeshInstance.scheduler = globalScheduler;

// Add debugger access
ScrollMeshInstance.debugger = globalDebugger;

// Add helper to enable/disable debugger
ScrollMeshInstance.enableDebugger = () => globalDebugger.enable();
ScrollMeshInstance.disableDebugger = () => globalDebugger.disable();

export default ScrollMeshInstance;

