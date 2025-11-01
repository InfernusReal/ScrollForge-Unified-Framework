/**
 * ScrollForge - The Unified Reactive Framework
 * 
 * Combines three engines:
 * - ScrollScript: Universal data flow (client + server)
 * - ScrollWeave: Logic-reactive styling
 * - ScrollMesh: Recursive component assembly
 * 
 * "Behavior is structure. Structure is style. Style is logic."
 */

import { ScrollScriptClient } from './script/client.js';
import { ScrollWeaveCore } from './weave/core.js';
import { ScrollMeshCore } from './mesh/core.js';

export class ScrollForge {
  constructor(config = {}) {
    // Initialize all three engines
    this.Script = new ScrollScriptClient(config.script || {});
    this.Weave = new ScrollWeaveCore(config.weave || {});
    this.Mesh = new ScrollMeshCore(config.mesh || {});

    // Integration layer
    this._setupIntegration();

    if (config.debugMode) {
      console.log('[ScrollForge] Initialized - All engines ready');
    }
  }

  /**
   * Setup integration between engines
   */
  _setupIntegration() {
    // Auto-update styles when signals change
    this._integrateScriptAndWeave();
    
    // Auto-update components when signals change
    this._integrateScriptAndMesh();
    
    // Allow Mesh components to use Weave styles
    this._integrateMeshAndWeave();
  }

  /**
   * Integrate ScrollScript and ScrollWeave
   * Signals automatically update styles
   */
  _integrateScriptAndWeave() {
    // Store style bindings
    this._styleBindings = new Map();
  }

  /**
   * Bind signal to style updates
   */
  bindStyle(signalName, selector, styleMapper) {
    this.Script.watch(signalName, (value) => {
      const styles = styleMapper(value);
      this.Weave.apply(selector, styles);
    });

    this._styleBindings.set(signalName, { selector, styleMapper });
  }

  /**
   * Integrate ScrollScript and ScrollMesh
   * Signals automatically update components
   */
  _integrateScriptAndMesh() {
    this._componentBindings = new Map();
  }

  /**
   * Bind signal to component updates
   */
  bindComponent(signalName, component) {
    this.Script.watch(signalName, (value) => {
      if (component.mounted) {
        this.Mesh.update(component, { [signalName]: value });
      }
    });

    this._componentBindings.set(signalName, component);
  }

  /**
   * Integrate ScrollMesh and ScrollWeave
   * Components can use Weave styles
   */
  _integrateMeshAndWeave() {
    // Extend Mesh blueprint to support Weave styles
    const originalBlueprint = this.Mesh.blueprint.bind(this.Mesh);
    
    this.Mesh.blueprint = (name, definition) => {
      // Wrap definition to inject Weave styles
      const wrappedDefinition = (props, children) => {
        const result = typeof definition === 'function' 
          ? definition(props, children)
          : definition;

        // Apply Weave styles if specified
        if (props.weaveStyles) {
          setTimeout(() => {
            this.Weave.apply(result.attrs?.class || `.${name}`, props.weaveStyles);
          }, 0);
        }

        return result;
      };

      return originalBlueprint(name, wrappedDefinition);
    };
  }

  /**
   * Create a reactive component (all engines working together)
   */
  component(name, config) {
    const {
      signals = {},
      actions = {},
      styles = {},
      render,
    } = config;

    // Register signals
    Object.entries(signals).forEach(([name, initialValue]) => {
      this.Script.signal(name, initialValue);
    });

    // Register actions
    Object.entries(actions).forEach(([type, handler]) => {
      this.Script.action(type, handler);
    });

    // Register blueprint
    this.Mesh.blueprint(name, (props, children) => {
      const element = render(props, children, this);

      // Apply styles
      if (styles) {
        setTimeout(() => {
          const selector = element.attrs?.class 
            ? `.${element.attrs.class}`
            : `.${name}`;
          this.Weave.apply(selector, styles);
        }, 0);
      }

      return element;
    });

    return name;
  }

  /**
   * Mount application
   */
  mount(component, container) {
    return this.Mesh.render(component, container);
  }

  /**
   * Create app (convenience method)
   */
  createApp(rootComponent) {
    return {
      mount: (container) => this.mount(rootComponent, container),
      unmount: () => this.Mesh.unmount(rootComponent),
    };
  }

  /**
   * Reset all engines
   */
  reset() {
    this.Script.reset();
    this.Weave.reset();
    this.Mesh.reset();
  }
}

// Export individual engines
export { ScrollScriptClient, ScrollScriptCore } from './script/index.js';
export { ScrollScriptServer } from './script/server.js';
export { ScrollWeaveCore } from './weave/core.js';
export { ScrollMeshCore } from './mesh/core.js';

// Export the class as default
export default ScrollForge;

