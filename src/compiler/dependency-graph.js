/**
 * Dependency Graph Generator
 * Maps which signals affect which components
 */

export class DependencyGraph {
  constructor() {
    this.nodes = new Map(); // id -> node
    this.edges = new Map(); // from -> [to]
    this.reverseEdges = new Map(); // to -> [from]
  }

  /**
   * Add node (signal or component)
   */
  addNode(id, type, metadata = {}) {
    if (!id) {
      throw new Error('Node id is required');
    }

    const existing = this.nodes.get(id);
    if (existing) {
      if (type) {
        existing.type = type;
      }
      existing.metadata = { ...existing.metadata, ...metadata };
      return existing;
    }

    const node = {
      id,
      type, // 'signal', 'component', 'action', 'derived'
      metadata: { ...metadata },
      dependsOn: [],
      affectedBy: [],
      affects: []
    };

    this.nodes.set(id, node);
    return node;
  }

  /**
   * Add edge (dependency relationship)
   */
  addEdge(from, to) {
    if (!from || !to) {
      throw new Error('Both "from" and "to" ids are required for an edge');
    }

    // Ensure nodes exist
    const fromNode = this.addNode(from, this.nodes.get(from)?.type || 'unknown');
    const toNode = this.addNode(to, this.nodes.get(to)?.type || 'unknown');

    // from affects to
    if (!this.edges.has(from)) {
      this.edges.set(from, []);
    }
    const outgoing = this.edges.get(from);
    if (!outgoing.includes(to)) {
      outgoing.push(to);
    }

    // Reverse mapping
    if (!this.reverseEdges.has(to)) {
      this.reverseEdges.set(to, []);
    }
    const incoming = this.reverseEdges.get(to);
    if (!incoming.includes(from)) {
      incoming.push(from);
    }

    // Update node metadata
    if (!fromNode.affects.includes(to)) {
      fromNode.affects.push(to);
    }

    if (!toNode.dependsOn.includes(from)) {
      toNode.dependsOn.push(from);
    }

    if (!toNode.affectedBy.includes(from)) {
      toNode.affectedBy.push(from);
    }
  }

  /**
   * Get all nodes affected by a signal
   */
  getAffectedNodes(signalId) {
    const affected = new Set();
    const queue = [signalId];

    while (queue.length > 0) {
      const current = queue.shift();
      const edges = this.edges.get(current) || [];

      edges.forEach(target => {
        if (!affected.has(target)) {
          affected.add(target);
          queue.push(target);
        }
      });
    }

    return Array.from(affected);
  }

  /**
   * Get all dependencies of a component
   */
  getDependencies(componentId) {
    return this.reverseEdges.get(componentId) || [];
  }

  /**
   * Topological sort (for render order)
   */
  topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      if (temp.has(nodeId)) {
        throw new Error('Circular dependency detected');
      }

      temp.add(nodeId);

      const deps = this.reverseEdges.get(nodeId) || [];
      deps.forEach(visit);

      temp.delete(nodeId);
      visited.add(nodeId);
      sorted.push(nodeId);
    };

    this.nodes.forEach((node, id) => {
      if (!visited.has(id)) {
        visit(id);
      }
    });

    return sorted;
  }

  /**
   * Detect circular dependencies
   */
  findCircularDependencies() {
    const cycles = [];
    const visited = new Set();
    const stack = [];

    const visit = (nodeId) => {
      if (stack.includes(nodeId)) {
        // Found cycle
        const cycleStart = stack.indexOf(nodeId);
        cycles.push(stack.slice(cycleStart).concat(nodeId));
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      stack.push(nodeId);

      const deps = this.reverseEdges.get(nodeId) || [];
      deps.forEach(visit);

      stack.pop();
    };

    this.nodes.forEach((node, id) => visit(id));

    return cycles;
  }

  /**
   * Generate visual graph data
   */
  toVisualData() {
    const nodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      label: node.id,
      type: node.type,
      group: node.type
    }));

    const edges = [];
    this.edges.forEach((targets, source) => {
      targets.forEach(target => {
        edges.push({
          from: source,
          to: target
        });
      });
    });

    return { nodes, edges };
  }

  /**
   * Export to JSON
   */
  toJSON() {
    return {
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries()),
      stats: {
        totalNodes: this.nodes.size,
        totalEdges: Array.from(this.edges.values())
          .reduce((sum, arr) => sum + arr.length, 0)
      }
    };
  }
}

export function createDependencyGraph() {
  return new DependencyGraph();
}

