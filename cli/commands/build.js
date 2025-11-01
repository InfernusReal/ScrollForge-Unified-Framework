/**
 * ScrollForge CLI - Build Command
 * Production build
 */

import fs from 'fs';
import path from 'path';

export async function build(options) {
  const { output, minify } = options;

  console.log('\n== Building ScrollForge project ==\n');

  const outputDir = path.join(process.cwd(), output);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy files
  const filesToCopy = ['index.html', 'app.js'];

  filesToCopy.forEach((file) => {
    const srcPath = path.join(process.cwd(), file);
    const destPath = path.join(outputDir, file);

    if (fs.existsSync(srcPath)) {
      let content = fs.readFileSync(srcPath, 'utf-8');

      // Simple minification if requested
      if (minify && file.endsWith('.js')) {
        content = content
          .replace(/\/\/.*$/gm, '') // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .trim();
      }

      fs.writeFileSync(destPath, content);
      console.log(`[ok] Copied: ${file}`);
    }
  });

  console.log(`\n[ok] Build complete! Output: ${output}\n`);
}
