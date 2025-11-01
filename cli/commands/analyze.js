/**
 * Analyze Command
 * Static analysis and optimization hints
 */

import fs from 'fs';
import path from 'path';
import { createAnalyzer } from '../../src/compiler/analyzer.js';
import { createDependencyGraph } from '../../src/compiler/dependency-graph.js';

export async function analyze(options) {
  console.log('\\n== Analyzing ScrollForge project ==\\n');

  const analyzer = createAnalyzer();
  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('[!] No src directory found');
    process.exit(1);
  }

  // Find all JS files
  const files = findJSFiles(srcDir);
  console.log(`Found ${files.length} files\n`);

  // Analyze each file
  files.forEach(file => {
    const code = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(process.cwd(), file);
    analyzer.analyze(code, relativePath);
  });

  // Build dependency graph
  analyzer.buildDependencyGraph();
  analyzer.mapSignalUsage();

  // Get report
  const report = analyzer.getReport();

  // Display results
  console.log('[ok] Analysis complete\n');
  console.log(`Modules: ${report.modules}`);
  console.log(`Signals: ${report.totalSignals}`);
  console.log(`Actions: ${report.totalActions}`);
  console.log(`Components: ${report.totalComponents}`);

  // Dead code
  if (report.deadCode.signals.length > 0) {
    console.log(`\n[!] Unused signals: ${report.deadCode.signals.join(', ')}`);
  }

  // Optimizations
  if (report.optimizations.length > 0) {
    console.log('\n== Optimization Hints ==\n');
    report.optimizations.forEach(hint => {
      console.log(`[${hint.type}] ${hint.message}`);
    });
  }

  // Find cycles
  if (options.findCycles) {
    console.log('\n== Checking for circular dependencies ==\n');
    const cycles = findCircularDependencies(analyzer);

    if (cycles.length > 0) {
      console.error(`[!] Found ${cycles.length} circular dependency chain${cycles.length > 1 ? 's' : ''}:`);
      cycles.forEach(cycle => {
        console.error(` - ${cycle.join(' -> ')}`);
      });
      process.exitCode = 1;
    } else {
      console.log('[ok] No circular dependencies found');
    }
  }

  console.log('');
}

function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        findJSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function findCircularDependencies(analyzer) {
  const graph = createDependencyGraph();

  analyzer.modules.forEach((analysis, modulePath) => {
    graph.addNode(modulePath, 'module', { path: modulePath });

    analysis.imports.forEach(imp => {
      const target = resolveImport(modulePath, imp.source);
      if (!target) return;

      graph.addNode(target, 'module', { path: target });
      graph.addEdge(modulePath, target);
    });
  });

  return graph.findCircularDependencies();
}

function resolveImport(fromModule, importSource) {
  if (typeof importSource !== 'string') {
    return null;
  }

  if (!importSource.startsWith('.')) {
    return null;
  }

  const absoluteFrom = path.resolve(process.cwd(), fromModule);
  const fromDir = path.dirname(absoluteFrom);
  let resolvedPath = path.resolve(fromDir, importSource);

  if (!path.extname(resolvedPath)) {
    const directFile = `${resolvedPath}.js`;
    const indexFile = path.join(resolvedPath, 'index.js');

    if (fs.existsSync(directFile)) {
      resolvedPath = directFile;
    } else if (fs.existsSync(indexFile)) {
      resolvedPath = indexFile;
    }
  }

  if (!fs.existsSync(resolvedPath)) {
    return null;
  }

  const relative = path.relative(process.cwd(), resolvedPath);
  return relative ? relative.replace(/\\/g, '/') : null;
}

