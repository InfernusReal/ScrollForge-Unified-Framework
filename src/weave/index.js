/**
 * ScrollWeave - Logic-Reactive Styling Engine
 * 
 * "Style is not separate from behavior"
 * Make visual output a first-class function of state
 */

export { ScrollWeaveCore } from './core.js';

// Export default instance for convenience
import { ScrollWeaveCore } from './core.js';

const ScrollWeave = new ScrollWeaveCore();

export default ScrollWeave;

