/**
 * Code Generation Command
 * Generate components, routes, etc.
 */

import fs from 'fs';
import path from 'path';

const templates = {
  component: (name) => `import { HTMLScrollMesh } from 'scrollforge/mesh';

export const ${name} = HTMLScrollMesh(
  // HTML
  ({ data }) => \`
    <div class="${name.toLowerCase()}">
      <h2>${name}</h2>
      <p>\${data}</p>
    </div>
  \`,
  
  // Logic
  (events, state) => {
    events.on('click', '.${name.toLowerCase()}', () => {
      console.log('${name} clicked');
    });
  },
  
  // State
  () => ({
    data: 'Hello from ${name}!'
  })
);
`,

  route: (name) => `export async function ${name}Handler(req, res) {
  const server = req.app.server;
  
  // Your logic here
  server.json(res, {
    message: '${name} route'
  });
}
`,

  action: (name) => `app.Script.action('${name}', (payload) => {
  // Your action logic here
  console.log('${name} triggered with:', payload);
});
`,

  signal: (name) => `app.Script.signal('${name}', initialValue);
`,

  test: (name) => `import { test } from 'node:test';
import assert from 'node:assert';

test('${name}', async () => {
  // Your test here
  assert.strictEqual(1 + 1, 2);
});
`
};

export async function generate(type, name, options) {
  console.log(\`\\n== Generating \${type}: \${name} ==\\n\`);

  const template = templates[type];
  
  if (!template) {
    console.error(\`[!] Unknown type: \${type}\`);
    console.log('Available types: component, route, action, signal, test');
    process.exit(1);
  }

  const code = template(name);
  const fileName = \`\${name}.\${type === 'test' ? 'test.js' : 'js'}\`;
  const filePath = path.join(process.cwd(), fileName);

  if (fs.existsSync(filePath) && !options.force) {
    console.error(\`[!] File already exists: \${fileName}\`);
    console.log('Use --force to overwrite');
    process.exit(1);
  }

  fs.writeFileSync(filePath, code);

  console.log(\`[ok] Generated: \${fileName}\\n\`);
}

