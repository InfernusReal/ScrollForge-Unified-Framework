/**
 * ScrollForge Static Analyzer
 * Analyzes ScrollForge code to generate dependency graphs and optimize
 */

import * as acorn from 'acorn';

export class StaticAnalyzer {
  constructor() {
    this.modules = new Map();
    this.dependencyGraph = new Map();
    this.signalUsage = new Map();
    this.componentTree = new Map();
  }

  /**
   * Analyze a module
   */
  analyze(code, modulePath) {
    const ast = acorn.parse(code, {
      ecmaVersion: 2022,
      sourceType: 'module'
    });

    const analysis = {
      path: modulePath,
      imports: [],
      exports: [],
      signals: [],
      actions: [],
      components: [],
      weaveRules: [],
      dependencies: new Set()
    };

    this._walkAST(ast, analysis);
    this.modules.set(modulePath, analysis);
    
    return analysis;
  }

  /**
   * Walk AST and extract information
   */
  _walkAST(node, analysis) {
    if (!node || typeof node !== 'object') return;

    // Detect imports
    if (node.type === 'ImportDeclaration') {
      analysis.imports.push({
        source: node.source.value,
        specifiers: node.specifiers.map(s => s.local.name)
      });
    }

    // Detect exports
    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      if (node.declaration) {
        const name = node.declaration.id?.name || 'default';
        analysis.exports.push(name);
      }
    }

    // Detect signal creation
    if (node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property.name === 'signal') {
      
      const signalName = node.arguments[0]?.value;
      if (signalName) {
        analysis.signals.push(signalName);
      }
    }

    // Detect action registration
    if (node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.property.name === 'action') {
      
      const actionType = node.arguments[0]?.value;
      if (actionType) {
        analysis.actions.push(actionType);
      }
    }

    // Detect ScrollMesh components
    if (node.type === 'CallExpression' &&
        (node.callee.name === 'ScrollMesh' || 
         node.callee.name === 'HTMLScrollMesh')) {
      
      analysis.components.push({
        type: node.callee.name,
        functionCount: node.arguments.length
      });
    }

    // Detect weave rules
    if (node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'Weave') {
      
      analysis.weaveRules.push({
        method: node.callee.property.name,
        selector: node.arguments[0]?.value
      });
    }

    // Recurse
    for (const key in node) {
      if (key === 'loc' || key === 'range') continue;
      
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(c => this._walkAST(c, analysis));
      } else if (child && typeof child === 'object') {
        this._walkAST(child, analysis);
      }
    }
  }

  /**
   * Build dependency graph
   */
  buildDependencyGraph() {
    this.modules.forEach((analysis, modulePath) => {
      const deps = new Set();

      // Add import dependencies
      analysis.imports.forEach(imp => {
        deps.add(imp.source);
      });

      this.dependencyGraph.set(modulePath, Array.from(deps));
    });

    return this.dependencyGraph;
  }

  /**
   * Find which components use which signals
   */
  mapSignalUsage() {
    this.modules.forEach((analysis, modulePath) => {
      analysis.signals.forEach(signal => {
        if (!this.signalUsage.has(signal)) {
          this.signalUsage.set(signal, []);
        }
        this.signalUsage.get(signal).push(modulePath);
      });
    });

    return this.signalUsage;
  }

  /**
   * Detect unused code
   */
  findDeadCode() {
    const deadCode = {
      signals: [],
      actions: [],
      components: []
    };

    // Find signals that are created but never read
    this.modules.forEach((analysis) => {
      analysis.signals.forEach(signal => {
        const usage = this.signalUsage.get(signal) || [];
        if (usage.length === 1) {
          // Only created, never used elsewhere
          deadCode.signals.push(signal);
        }
      });
    });

    return deadCode;
  }

  /**
   * Generate optimization hints
   */
  generateOptimizations() {
    const hints = [];

    // Find components that could be code-split
    this.modules.forEach((analysis, path) => {
      if (analysis.components.length > 5) {
        hints.push({
          type: 'code-splitting',
          path,
          message: `Module has ${analysis.components.length} components - consider splitting`
        });
      }
    });

    // Find signals used by many components (should be global)
    this.signalUsage.forEach((modules, signal) => {
      if (modules.length > 10) {
        hints.push({
          type: 'global-signal',
          signal,
          message: `Signal '${signal}' used by ${modules.length} modules - ensure it's global`
        });
      }
    });

    return hints;
  }

  /**
   * Export analysis report
   */
  getReport() {
    return {
      modules: this.modules.size,
      totalSignals: Array.from(this.signalUsage.keys()).length,
      totalActions: Array.from(this.modules.values())
        .reduce((sum, m) => sum + m.actions.length, 0),
      totalComponents: Array.from(this.modules.values())
        .reduce((sum, m) => sum + m.components.length, 0),
      dependencyGraph: this.dependencyGraph,
      signalUsage: this.signalUsage,
      deadCode: this.findDeadCode(),
      optimizations: this.generateOptimizations()
    };
  }
}

export function createAnalyzer() {
  return new StaticAnalyzer();
}

