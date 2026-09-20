// Run directly: `node src/utils/storage.test.js`. No test runner is installed,
// and this one calculation does not justify adding one.
//
// Only getStreakInfo's day count is covered: it is the one place in storage.js
// with arithmetic that can be quietly wrong. The DST cases are the point —
// counting 24-hour blocks instead of calendar days drifts by a day twice a
// year and never recovers.
process.env.TZ = 'America/New_York';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

// storage.js is ES modules and imports AsyncStorage at the top level, which
// plain node cannot load. Compile it to CommonJS and hand it a stub — none of
// the streak math touches storage.
const file = path.join(__dirname, 'storage.js');
const { code } = babel.transformSync(fs.readFileSync(file, 'utf8'), {
  filename: file,
  babelrc: false,
  configFile: false,
  plugins: ['@babel/plugin-transform-modules-commonjs'],
});
const storage = {};
new Function('exports', 'require', code)(storage, () => ({ default: {} }));

// getStreakInfo reads the wall clock, so the clock is what gets replaced.
function asOf(iso, fn) {
  const Real = Date;
  const fixed = new Real(iso).getTime();
  globalThis.Date = class extends Real {
    constructor(...args) {
      super(...(args.length ? args : [fixed]));
    }
    static now() {
      return fixed;
    }
  };
  try {
    return fn();
  } finally {
    globalThis.Date = Real;
  }
}

const days = (quitDate, nowIso) =>
  asOf(nowIso, () => storage.getStreakInfo(quitDate).days);

// Spring forward: Mar 8 2026 is 23 hours long, so elapsed-ms math loses a day.
assert.strictEqual(days('2026-03-07', '2026-03-09T04:30:00Z'), 2);

// Fall back: Nov 1 2026 is 25 hours long, so elapsed-ms math gains a day.
assert.strictEqual(days('2026-10-31', '2026-11-02T04:30:00Z'), 1);

// Ordinary days, no DST in range.
assert.strictEqual(days('2026-09-20', '2026-09-21T03:59:00Z'), 0); // 23:59 local
assert.strictEqual(days('2026-09-20', '2026-09-21T04:01:00Z'), 1); // 00:01 local
assert.strictEqual(days('2026-09-01', '2026-09-21T16:00:00Z'), 20);

// A quit date in the future clamps instead of going negative.
assert.strictEqual(days('2027-01-01', '2026-09-21T16:00:00Z'), 0);

// weeks and progress ride on days.
const streak = asOf('2026-09-21T16:00:00Z', () => storage.getStreakInfo('2026-09-01'));
assert.strictEqual(streak.weeks, 2);
assert.strictEqual(streak.progress, 20 / 365);

console.log('storage.getStreakInfo: 8 assertions passed');
