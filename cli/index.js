#!/usr/bin/env node

/**
 * ScrollForge CLI
 * Command-line tools for ScrollForge development
 */

import { program } from 'commander';
import { createProject } from './commands/create.js';
import { devServer } from './commands/dev.js';
import { build } from './commands/build.js';

program
  .name('sf')
  .description('ScrollForge CLI - The Unified Reactive Framework')
  .version('0.3.0');

// Create command
program
  .command('create <project-name>')
  .description('Create a new ScrollForge project')
  .option('-t, --template <template>', 'Project template (basic, counter, scroll)', 'basic')
  .action(createProject);

// Dev command
program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-o, --open', 'Open browser automatically')
  .action(devServer);

// Build command
program
  .command('build')
  .description('Build for production')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .option('--minify', 'Minify output')
  .action(build);

// Generate command (lazy load)
program
  .command('generate <type> <name>')
  .description('Generate component, route, action, signal, or test')
  .option('-f, --force', 'Overwrite existing file')
  .action(async (type, name, options) => {
    const { generate } = await import('./commands/generate.js');
    await generate(type, name, options);
  });

// Analyze command (lazy load)
program
  .command('analyze')
  .description('Analyze project for optimizations')
  .option('--find-cycles', 'Check for circular dependencies')
  .action(async (options) => {
    const { analyze } = await import('./commands/analyze.js');
    await analyze(options);
  });

program.parse();

