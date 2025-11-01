/**
 * Advanced Virtualization
 * Lists, trees, grids, portals for massive datasets
 */

export class VirtualList {
  constructor(container, items, renderItem, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error(`VirtualList container not found: ${container}`);
    }
    
    this.items = items;
    this.renderItem = renderItem;
    this.itemHeight = options.itemHeight || 50;
    this.overscan = options.overscan || 5;
    this.visibleItems = new Map();
    this.scrollTop = 0;
    this.defaultHeight = options.defaultHeight || 400;
    
    this._setup();
    this._render();
  }

  _setup() {
    const computedStyle = typeof window !== 'undefined'
      ? window.getComputedStyle(this.container)
      : this.container.style;

    if ((computedStyle.position || this.container.style.position) === 'static') {
      this.container.style.position = 'relative';
    }

    if (
      (computedStyle.overflowY === 'visible' || computedStyle.overflowY === '' || !computedStyle.overflowY) &&
      !this.container.style.overflowY
    ) {
      this.container.style.overflowY = 'auto';
    }

    if (
      (!computedStyle.height || computedStyle.height === 'auto' || computedStyle.height === '0px') &&
      !this.container.style.height
    ) {
      this.container.style.height = `${this.defaultHeight}px`;
    }
    
    // Virtual height
    const totalHeight = this.items.length * this.itemHeight;
    this.container.innerHTML = `<div style="height: ${totalHeight}px; position: relative;"></div>`;
    this.viewport = this.container.firstChild;
    
    // Scroll handler
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      this._render();
    });
  }

  _render() {
    const containerHeight = this.container.clientHeight;
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.ceil((this.scrollTop + containerHeight) / this.itemHeight);
    
    const visibleStart = Math.max(0, startIndex - this.overscan);
    const visibleEnd = Math.min(this.items.length, endIndex + this.overscan);

    // Remove items outside range
    this.visibleItems.forEach((element, index) => {
      if (index < visibleStart || index >= visibleEnd) {
        element.remove();
        this.visibleItems.delete(index);
      }
    });

    // Add items in range
    for (let i = visibleStart; i < visibleEnd; i++) {
      if (!this.visibleItems.has(i)) {
        const item = this.items[i];
        const element = this.renderItem(item, i);
        
        element.style.position = 'absolute';
        element.style.top = `${i * this.itemHeight}px`;
        element.style.height = `${this.itemHeight}px`;
        element.style.width = '100%';
        
        this.viewport.appendChild(element);
        this.visibleItems.set(i, element);
      }
    }
  }

  update(newItems) {
    this.items = newItems;
    const totalHeight = this.items.length * this.itemHeight;
    this.viewport.style.height = `${totalHeight}px`;
    this._render();
  }

  scrollToIndex(index) {
    this.container.scrollTop = index * this.itemHeight;
  }

  destroy() {
    this.container.innerHTML = '';
    this.visibleItems.clear();
  }
}

export class VirtualTree {
  constructor(container, nodes, renderNode, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error(`VirtualTree container not found: ${container}`);
    }
    
    this.nodes = nodes;
    this.renderNode = renderNode;
    this.nodeHeight = options.nodeHeight || 30;
    this.expanded = new Set();
    
    this._render();
  }

  _flattenNodes(nodes, depth = 0) {
    const flat = [];
    
    nodes.forEach(node => {
      flat.push({ ...node, depth });
      
      if (this.expanded.has(node.id) && node.children) {
        flat.push(...this._flattenNodes(node.children, depth + 1));
      }
    });
    
    return flat;
  }

  _render() {
    const flatNodes = this._flattenNodes(this.nodes);
    
    this.container.innerHTML = '';
    flatNodes.forEach((node, index) => {
      const element = this.renderNode(node, index);
      element.style.paddingLeft = `${node.depth * 20}px`;
      
      if (node.children && node.children.length > 0) {
        const toggle = document.createElement('span');
        toggle.textContent = this.expanded.has(node.id) ? '▼' : '▶';
        toggle.style.cursor = 'pointer';
        toggle.style.marginRight = '5px';
        
        toggle.addEventListener('click', () => {
          this.toggle(node.id);
        });
        
        element.prepend(toggle);
      }
      
      this.container.appendChild(element);
    });
  }

  toggle(nodeId) {
    if (this.expanded.has(nodeId)) {
      this.expanded.delete(nodeId);
    } else {
      this.expanded.add(nodeId);
    }
    this._render();
  }

  expandAll() {
    const getAllIds = (nodes) => {
      let ids = [];
      nodes.forEach(node => {
        ids.push(node.id);
        if (node.children) {
          ids = ids.concat(getAllIds(node.children));
        }
      });
      return ids;
    };

    getAllIds(this.nodes).forEach(id => this.expanded.add(id));
    this._render();
  }

  collapseAll() {
    this.expanded.clear();
    this._render();
  }
}

export class Portal {
  constructor(component, targetSelector) {
    this.component = component;
    this.target = typeof targetSelector === 'string'
      ? document.querySelector(targetSelector)
      : targetSelector;
    
    if (!this.target) {
      throw new Error('Portal target not found');
    }
  }

  mount() {
    if (this.component.mount) {
      this.component.mount(this.target);
    } else {
      this.target.appendChild(this.component);
    }
  }

  unmount() {
    if (this.component.unmount) {
      this.component.unmount();
    } else {
      this.target.innerHTML = '';
    }
  }
}

export function createVirtualList(container, items, renderItem, options) {
  return new VirtualList(container, items, renderItem, options);
}

export function createVirtualTree(container, nodes, renderNode, options) {
  return new VirtualTree(container, nodes, renderNode, options);
}

export function createPortal(component, target) {
  return new Portal(component, target);
}

