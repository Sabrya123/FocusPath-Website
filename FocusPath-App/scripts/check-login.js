#!/usr/bin/env node
// Runs automatically before `npm start` and `npm run tunnel` (npm pre-hooks).
// Warns when Expo Go on iOS will refuse this project. Never blocks the server.

const { problems } = require('./expo-go-readiness');

const found = problems();
if (found.length === 0) process.exit(0);

console.log('\n  ' + '-'.repeat(66));
console.log('  Expo Go on iOS will refuse to open this project.\n');
found.forEach((p, i) => {
  console.log(`  ${i + 1}. ${p.what}`);
  console.log(`     fix:  ${p.fix}\n`);
});
console.log('  Then on your phone: Expo Go > avatar icon > sign in with the');
console.log('  SAME account. Signing out of Expo Go does not get around this.');
console.log('  ' + '-'.repeat(66) + '\n');
