/**
 * ScrollScript - Universal Data Flow Engine
 * 
 * Based on Shared Variables Theory:
 * Connect functions, loops, and conditionals using shared variables.
 * A single apex manager that deals with all data flow.
 */

export { ScrollScriptCore } from './core.js';
export { ScrollScriptClient } from './client.js';
export { ScrollScriptServer } from './server.js';
export { ScrollScriptServerAdvanced } from './server-advanced.js';
export { ScrollScriptServerUltimate } from './server-ultimate.js';
export { ForgeFetch, createForgeFetch } from './forge-fetch.js';
export { Router, createRouter } from './router.js';
export { Channel, ChannelManager } from './channels.js';
export { MiddlewareLanes } from './middleware-lanes.js';
export { ActionPipeline, pipeline } from './action-pipelines.js';
export { NetHub, createNetHub } from './net-hub.js';
export { CollaborationLoop, createCollaborationLoop } from './collaboration.js';
export { DevTools, createDevTools } from './dev-tools.js';

// Auto-detect environment and export appropriate runtime
import { ScrollScriptClient } from './client.js';
import { ScrollScriptServer } from './server.js';

const ScrollScript = typeof window !== 'undefined' ? ScrollScriptClient : ScrollScriptServer;

export default ScrollScript;

