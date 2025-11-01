/**
 * ScrollMesh Visual Debugger
 * Live visualization of data flow and component state
 */

export class VisualDebugger {
  constructor() {
    this.components = new Map();
    this.panel = null;
    this.graph = null;
    this.updateInterval = null;
    this.enabled = false;
  }

  /**
   * Enable visual debugger
   */
  enable() {
    if (this.enabled) return;
    
    this.enabled = true;
    this._createPanel();
    this._startUpdates();
  }

  /**
   * Disable visual debugger
   */
  disable() {
    if (!this.enabled) return;
    
    this.enabled = false;
    this._removePanel();
    this._stopUpdates();
  }

  /**
   * Register a component for debugging
   */
  register(component) {
    this.components.set(component.name || component.id, {
      component,
      state: component.state,
      dependencies: component.dependencies || new Set(),
      renderCount: 0,
      lastRenderTime: 0,
      avgRenderTime: 0,
    });

    if (this.enabled) {
      this._updatePanel();
    }
  }

  /**
   * Unregister a component
   */
  unregister(componentName) {
    this.components.delete(componentName);
    
    if (this.enabled) {
      this._updatePanel();
    }
  }

  /**
   * Track render performance
   */
  trackRender(componentName, duration) {
    const data = this.components.get(componentName);
    if (!data) return;

    data.renderCount++;
    data.lastRenderTime = duration;
    data.avgRenderTime = ((data.avgRenderTime * (data.renderCount - 1)) + duration) / data.renderCount;

    if (this.enabled) {
      this._updatePanel();
    }
  }

  /**
   * Create debug panel UI
   */
  _createPanel() {
    if (this.panel) return;

    this.panel = document.createElement('div');
    this.panel.id = 'scrollforge-debugger';
    this.panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 80vh;
      background: rgba(0, 0, 0, 0.95);
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      border-radius: 10px;
      padding: 15px;
      z-index: 999999;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 2px solid #0f0;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #0f0;
    `;
    header.innerHTML = `
      <strong style="font-size: 14px;">ScrollForge Debugger</strong>
      <button id="close-debugger" style="
        background: #f00;
        color: #fff;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 10px;
      ">Close</button>
    `;

    this.panel.appendChild(header);

    // Content area
    const content = document.createElement('div');
    content.id = 'debugger-content';
    this.panel.appendChild(content);

    document.body.appendChild(this.panel);

    // Close button handler
    document.getElementById('close-debugger').addEventListener('click', () => {
      this.disable();
    });

    this._updatePanel();
  }

  /**
   * Remove debug panel
   */
  _removePanel() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
  }

  /**
   * Update panel content
   */
  _updatePanel() {
    if (!this.panel) return;

    const content = document.getElementById('debugger-content');
    if (!content) return;

    let html = '';

    // Global stats
    html += `
      <div style="margin-bottom: 15px; padding: 10px; background: rgba(0, 255, 0, 0.1); border-radius: 5px;">
        <div><strong>Components:</strong> ${this.components.size}</div>
        <div><strong>FPS:</strong> ${this._getFPS()}</div>
        <div><strong>Memory:</strong> ${this._getMemoryUsage()}</div>
      </div>
    `;

    // Component list
    this.components.forEach((data, name) => {
      const isPerformant = data.avgRenderTime < 16; // 60fps threshold
      const statusColor = isPerformant ? '#0f0' : '#ff0';

      html += `
        <div style="
          margin-bottom: 10px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 5px;
          border-left: 3px solid ${statusColor};
        ">
          <div style="font-weight: bold; margin-bottom: 5px; color: ${statusColor};">
            ${name}
          </div>
          <div style="font-size: 11px; line-height: 1.5;">
            <div>State: ${this._formatState(data.state)}</div>
            <div>Dependencies: ${Array.from(data.dependencies).join(', ') || 'none'}</div>
            <div>Renders: ${data.renderCount}</div>
            <div>Avg Time: ${data.avgRenderTime.toFixed(2)}ms</div>
            <div>Last: ${data.lastRenderTime.toFixed(2)}ms</div>
          </div>
        </div>
      `;
    });

    content.innerHTML = html;
  }

  /**
   * Start periodic updates
   */
  _startUpdates() {
    this.updateInterval = setInterval(() => {
      if (this.enabled) {
        this._updatePanel();
      }
    }, 1000);
  }

  /**
   * Stop periodic updates
   */
  _stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Get current FPS
   */
  _getFPS() {
    // Simple FPS calculation (can be improved)
    return '~60fps';
  }

  /**
   * Get memory usage
   */
  _getMemoryUsage() {
    if (performance.memory) {
      const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      return `${used} MB`;
    }
    return 'N/A';
  }

  /**
   * Format state for display
   */
  _formatState(state) {
    if (!state) return '{}';
    
    const stateStr = JSON.stringify(state, null, 2);
    
    if (stateStr.length > 100) {
      return stateStr.substring(0, 100) + '...';
    }
    
    return stateStr;
  }

  /**
   * Create data flow graph (advanced visualization)
   */
  _createGraph() {
    // TODO: Implement graph visualization using Canvas or SVG
    // Show component relationships and data flow
  }
}

// Global debugger instance
export const globalDebugger = new VisualDebugger();

// Keyboard shortcut to toggle debugger
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    // Ctrl+Shift+D to toggle debugger
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      if (globalDebugger.enabled) {
        globalDebugger.disable();
      } else {
        globalDebugger.enable();
      }
    }
  });
}

