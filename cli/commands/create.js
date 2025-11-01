/**
 * ScrollForge CLI - Create Command
 * Scaffolds new ScrollForge projects
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const templates = {
  basic: {
    name: 'Basic',
    description: 'Minimal ScrollForge setup',
  },
  counter: {
    name: 'Counter',
    description: 'Interactive counter with all three engines',
  },
  scroll: {
    name: 'Scroll Navigator',
    description: 'Scroll-driven section navigator',
  },
};

export async function createProject(projectName, options) {
  const { template } = options;

  console.log(`\n== Creating ScrollForge project: ${projectName} ==`);
  console.log(`Template: ${templates[template]?.name || template}\n`);

  const projectPath = path.join(process.cwd(), projectName);

  // Create project directory
  if (fs.existsSync(projectPath)) {
    console.error(`[!] Error: Directory "${projectName}" already exists`);
    process.exit(1);
  }

  fs.mkdirSync(projectPath, { recursive: true });

  // Create package.json
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'sf dev',
      build: 'sf build',
    },
    dependencies: {
      scrollforge: '^0.1.0',
    },
  };

  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - ScrollForge</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml);

  // Create app.js based on template
  let appJs = '';

  if (template === 'counter') {
    appJs = getCounterTemplate();
  } else if (template === 'scroll') {
    appJs = getScrollTemplate();
  } else {
    appJs = getBasicTemplate();
  }

  fs.writeFileSync(path.join(projectPath, 'app.js'), appJs);

  // Create README
  const readme = `# ${projectName}

A ScrollForge project using the **${templates[template]?.name}** template.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## About ScrollForge

ScrollForge is a unified reactive framework combining:
- **ScrollScript**: Universal data flow
- **ScrollWeave**: Logic-reactive styling
- **ScrollMesh**: Recursive component assembly

Learn more at [ScrollForge Documentation](https://github.com/scrollforge)
`;

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

  console.log('[ok] Project created successfully!\n');
  console.log('Next steps:');
  console.log(`  cd ${projectName}`);
  console.log('  npm install');
  console.log('  npm run dev\n');
  console.log('Happy forging!\n');
}

function getBasicTemplate() {
  return `import ScrollForge from 'scrollforge';

const app = new ScrollForge();

// Create a signal
app.Script.signal('message', 'Hello ScrollForge!');

// Create a component
app.Mesh.blueprint('App', (props) => ({
  tag: 'div',
  style: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  content: props.message,
}));

// Render
function render() {
  const message = app.Script.get('message');
  const appComponent = app.Mesh.create('App', { message });
  app.Mesh.render(appComponent, '#app');
}

render();

console.log('ScrollForge app loaded.');
`;
}

function getCounterTemplate() {
  return `import ScrollForge from 'scrollforge';

const app = new ScrollForge({ debugMode: true });

// Signals
app.Script.signal('count', 0);

// Actions
app.Script.action('INCREMENT', () => {
  app.Script.set('count', app.Script.get('count') + 1);
});

app.Script.action('DECREMENT', () => {
  app.Script.set('count', app.Script.get('count') - 1);
});

// Components
app.Mesh.blueprint('Counter', (props) => ({
  tag: 'div',
  style: {
    textAlign: 'center',
    padding: '2rem',
  },
  children: [
    {
      tag: 'h1',
      content: \`Count: \${props.count}\`,
      style: { fontSize: '3rem', margin: '1rem' },
    },
    {
      tag: 'button',
      content: 'Increment',
      events: { click: () => app.Script.trigger('INCREMENT') },
      style: { margin: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem' },
    },
    {
      tag: 'button',
      content: 'Decrement',
      events: { click: () => app.Script.trigger('DECREMENT') },
      style: { margin: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem' },
    },
  ],
}));

// Render
function render() {
  const count = app.Script.get('count');
  const counter = app.Mesh.create('Counter', { count });
  app.Mesh.render(counter, '#app');
}

app.Script.watch('count', render);
render();

console.log('Counter app loaded.');
`;
}

function getScrollTemplate() {
  return `import ScrollForge from 'scrollforge';

const app = new ScrollForge({ debugMode: true });

const sections = [
  { id: 0, title: 'Section 1', color: '#667eea' },
  { id: 1, title: 'Section 2', color: '#f093fb' },
  { id: 2, title: 'Section 3', color: '#4facfe' },
];

app.Script.signal('index', 0);

app.Script.action('NEXT', () => {
  const index = app.Script.get('index');
  app.Script.set('index', Math.min(index + 1, sections.length - 1));
});

app.Script.action('PREV', () => {
  const index = app.Script.get('index');
  app.Script.set('index', Math.max(index - 1, 0));
});

app.Mesh.blueprint('Section', (props) => ({
  tag: 'div',
  style: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    background: props.color,
    color: 'white',
  },
  content: props.title,
}));

function render() {
  const index = app.Script.get('index');
  const section = app.Mesh.create('Section', sections[index]);
  app.Mesh.render(section, '#app');
}

app.Script.watch('index', render);
render();

app.Script.onKey('ArrowDown', 'NEXT');
app.Script.onKey('ArrowUp', 'PREV');

console.log('Scroll navigator loaded.');
`;
}
