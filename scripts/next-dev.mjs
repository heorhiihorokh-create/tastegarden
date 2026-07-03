import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { rmSync } from 'node:fs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const nextBin = join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const devDistDir = '.next-dev';

// Keep the development compiler cache separate from `next build` output.
// Without this, running a production build while localhost is open can leave
// the dev server reading a half-incompatible `.next/server/pages` tree and
// trigger errors such as missing `_document.js`.
if (!process.argv.includes('--turbo')) {
  rmSync(join(root, devDistDir), { recursive: true, force: true });
}

const child = spawn(process.execPath, [nextBin, 'dev', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    NEXT_DIST_DIR: devDistDir,
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
