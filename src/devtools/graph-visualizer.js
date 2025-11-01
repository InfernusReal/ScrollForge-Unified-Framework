/**
 * Graph Visualizer
 * Visual representation of component/signal dependencies
 */

export class GraphVisualizer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.nodes = [];
    this.edges = [];
    this.width = 800;
    this.height = 600;
  }

  /**
   * Initialize visualizer
   */
  init(container) {
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.border = '1px solid #ddd';
    this.canvas.style.borderRadius = '10px';
    
    el.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Click handler
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this._handleClick(x, y);
    });
  }

  /**
   * Add node (signal or component)
   */
  addNode(id, type, metadata = {}) {
    const x = Math.random() * (this.width - 100) + 50;
    const y = Math.random() * (this.height - 100) + 50;

    this.nodes.push({
      id,
      type, // 'signal', 'component', 'action'
      x,
      y,
      radius: 20,
      color: this._getColorForType(type),
      metadata,
      selected: false
    });
  }

  /**
   * Add edge (dependency)
   */
  addEdge(from, to) {
    this.edges.push({ from, to });
  }

  /**
   * Render graph
   */
  render() {
    if (!this.ctx) return;

    // Clear
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw edges
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 2;

    this.edges.forEach(edge => {
      const fromNode = this.nodes.find(n => n.id === edge.from);
      const toNode = this.nodes.find(n => n.id === edge.to);

      if (fromNode && toNode) {
        this.ctx.beginPath();
        this.ctx.moveTo(fromNode.x, fromNode.y);
        this.ctx.lineTo(toNode.x, toNode.y);
        this.ctx.stroke();

        // Arrow
        this._drawArrow(fromNode.x, fromNode.y, toNode.x, toNode.y);
      }
    });

    // Draw nodes
    this.nodes.forEach(node => {
      this.ctx.fillStyle = node.selected ? '#ff0' : node.color;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Border
      this.ctx.strokeStyle = node.selected ? '#f00' : '#333';
      this.ctx.lineWidth = node.selected ? 3 : 1;
      this.ctx.stroke();

      // Label
      this.ctx.fillStyle = '#000';
      this.ctx.font = '12px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.id, node.x, node.y + node.radius + 15);
    });
  }

  /**
   * Draw arrow
   */
  _drawArrow(fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowSize = 10;

    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - arrowSize * Math.cos(angle - Math.PI / 6),
      toY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - arrowSize * Math.cos(angle + Math.PI / 6),
      toY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }

  /**
   * Get color for node type
   */
  _getColorForType(type) {
    const colors = {
      signal: '#667eea',
      component: '#10b981',
      action: '#f59e0b',
      derived: '#8b5cf6'
    };
    return colors[type] || '#999';
  }

  /**
   * Handle click
   */
  _handleClick(x, y) {
    this.nodes.forEach(node => {
      const distance = Math.sqrt(
        Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2)
      );

      if (distance <= node.radius) {
        node.selected = !node.selected;
        this._showNodeInfo(node);
      }
    });

    this.render();
  }

  /**
   * Show node info panel
   */
  _showNodeInfo(node) {
    console.log('[Graph] Selected:', node);

    // Create info panel
    let panel = document.getElementById('node-info-panel');
    
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'node-info-panel';
      panel.style.cssText = \`
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border: 2px solid #667eea;
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 300px;
        z-index: 10000;
      \`;
      document.body.appendChild(panel);
    }

    panel.replaceChildren();

    const title = document.createElement('h3');
    title.style.margin = '0 0 10px 0';
    title.style.color = '#667eea';
    title.textContent = node.id ?? '(unnamed)';
    panel.appendChild(title);

    const typeLine = document.createElement('p');
    const typeLabel = document.createElement('strong');
    typeLabel.textContent = 'Type: ';
    typeLine.appendChild(typeLabel);
    typeLine.append(node.type ?? 'unknown');
    panel.appendChild(typeLine);

    const positionLine = document.createElement('p');
    const positionLabel = document.createElement('strong');
    positionLabel.textContent = 'Position: ';
    positionLine.appendChild(positionLabel);
    positionLine.append(\`(\${Math.round(node.x)}, \${Math.round(node.y)})\`);
    panel.appendChild(positionLine);

    const metadataLabel = document.createElement('p');
    const metadataStrong = document.createElement('strong');
    metadataStrong.textContent = 'Metadata:';
    metadataLabel.appendChild(metadataStrong);
    panel.appendChild(metadataLabel);

    const metadataBlock = document.createElement('pre');
    metadataBlock.style.margin = '0';
    metadataBlock.style.whiteSpace = 'pre-wrap';
    metadataBlock.textContent = this._stringifyMetadata(node.metadata);
    panel.appendChild(metadataBlock);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '0.5rem 1rem';
    closeButton.style.background = '#667eea';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginTop = '10px';
    closeButton.addEventListener('click', () => panel.remove());
    panel.appendChild(closeButton);
  }

  /**
   * Auto-layout (force-directed)
   */
  autoLayout(iterations = 100) {
    for (let i = 0; i < iterations; i++) {
      this._applyForces();
    }
    this.render();
  }

  _applyForces() {
    // Repulsion between nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const node1 = this.nodes[i];
        const node2 = this.nodes[j];

        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = 1000 / (distance * distance);

        node1.x -= (dx / distance) * force;
        node1.y -= (dy / distance) * force;
        node2.x += (dx / distance) * force;
        node2.y += (dy / distance) * force;
      }
    }

    // Attraction along edges
    this.edges.forEach(edge => {
      const fromNode = this.nodes.find(n => n.id === edge.from);
      const toNode = this.nodes.find(n => n.id === edge.to);

      if (fromNode && toNode) {
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = distance * 0.01;

        fromNode.x += (dx / distance) * force;
        fromNode.y += (dy / distance) * force;
        toNode.x -= (dx / distance) * force;
        toNode.y -= (dy / distance) * force;
      }
    });

    // Keep within bounds
    this.nodes.forEach(node => {
      node.x = Math.max(50, Math.min(this.width - 50, node.x));
      node.y = Math.max(50, Math.min(this.height - 50, node.y));
    });
  }

  /**
   * Clear graph
   */
  clear() {
    this.nodes = [];
    this.edges = [];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Safe stringify metadata for display
   */
  _stringifyMetadata(metadata) {
    const seen = new WeakSet();
    const replacer = (key, value) => {
      if (typeof value === 'function') {
        return `[function ${value.name || 'anonymous'}]`;
      }
      if (value && typeof value === 'object') {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    };

    try {
      return JSON.stringify(metadata, replacer, 2);
    } catch (error) {
      return '[unserializable metadata]';
    }
  }
}

export function createGraphVisualizer() {
  return new GraphVisualizer();
}

