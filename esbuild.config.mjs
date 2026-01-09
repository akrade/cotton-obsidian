import esbuild from 'esbuild';
import process from 'process';
import builtins from 'builtin-modules';
import { copyFileSync } from 'fs';

const prod = process.argv[2] === 'production';

// Create node: prefixed externals for Node.js built-ins
const nodeBuiltins = builtins.flatMap(m => [m, `node:${m}`]);

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
    ...nodeBuiltins,
  ],
  format: 'cjs',
  target: 'es2022',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
  minify: prod,
});

if (prod) {
  await context.rebuild();
  // Copy manifest and styles to output
  copyFileSync('manifest.json', 'manifest.json');
  process.exit(0);
} else {
  await context.watch();
}
