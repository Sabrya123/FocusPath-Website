#!/usr/bin/env node
// Rebuilds node_modules from scratch.
//
// Why this exists: a partial/interrupted install can leave orphaned nested
// packages (e.g. node_modules/@expo/metro/node_modules/metro) that Node
// resolves in preference to the correct hoisted copy. That produced
// "TypeError: fileMap.setMaxListeners is not a function" once already.
// Reinstalling from the lockfile is the reliable way out.

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');

const targets = [
  path.join(root, 'node_modules'),
  path.join(root, '.expo'),
  path.join(os.tmpdir(), 'metro-cache'),
  path.join(os.tmpdir(), 'haste-map-metro-cache'),
];

function remove(dir) {
  if (!fs.existsSync(dir)) return;
  process.stdout.write(`removing ${dir} ... `);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
      console.log('done');
      return;
    } catch (err) {
      if (attempt === 3) {
        console.log('FAILED');
        console.error(
          `\nCould not delete ${dir}: ${err.message}\n` +
          'Close any running Metro/Expo terminals and editors, pause OneDrive sync, then run again.'
        );
        process.exit(1);
      }
    }
  }
}

targets.forEach(remove);

const useCi = fs.existsSync(path.join(root, 'package-lock.json'));
const cmd = useCi ? 'npm ci' : 'npm install';
console.log(`\n> ${cmd}\n`);
execSync(cmd, { cwd: root, stdio: 'inherit' });

console.log('\n> npx expo install --check\n');
execSync('npx expo install --check', { cwd: root, stdio: 'inherit' });

console.log('\nClean install complete.');
