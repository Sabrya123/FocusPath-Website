/**
 * Self-check for the home scene's lettering geometry (src/components/EarthLetters.js).
 *
 *   node scripts/check-earth-letters.js
 *
 * The layout maths is the only non-obvious part of the earth scene: wrap, cap
 * auto-fit, and the deterministic jitter that stops the letters dancing between
 * renders. This fails loudly if any of that breaks. No test framework — the
 * module is compiled with the project's babel and its native imports stubbed.
 */
const assert = require('assert');
const path = require('path');
const Module = require('module');
const babel = require('@babel/core');

const STUBS = {
  react: { __esModule: true, default: {} },
  'react-native': {
    __esModule: true,
    View: 'View',
    Text: 'Text',
    StyleSheet: {
      create: (o) => o,
      flatten: (o) => Object.assign({}, ...[].concat(o).filter(Boolean)),
    },
  },
  'react-native-svg': {
    __esModule: true,
    default: 'Svg',
    Path: 'Path',
    Defs: 'Defs',
    LinearGradient: 'LinearGradient',
    Stop: 'Stop',
  },
};

const realLoad = Module._load;
Module._load = (request, parent, isMain) =>
  Object.prototype.hasOwnProperty.call(STUBS, request)
    ? STUBS[request]
    : realLoad(request, parent, isMain);

const file = path.join(__dirname, '..', 'src', 'components', 'EarthLetters.js');
const { code } = babel.transformFileSync(file, {
  presets: ['babel-preset-expo'],
  babelrc: false,
  configFile: false,
});
const mod = { exports: {} };
new Function('module', 'exports', 'require', code)(mod, mod.exports, require);
const { boneText, cloudTextPuffs } = mod.exports;

// ── bone lettering ─────────────────────────────────────────────────────────
const bone = boneText('Grounded', 29, 200);
assert.ok(bone.shaftA.length > 0 && bone.shaftB.length > 0, 'both bone groups must be drawn');
assert.ok(bone.knuckleA.length > 0 && bone.knuckleB.length > 0, 'bones need condyle lobes');
assert.ok(bone.swDark > bone.sw, 'the dark contour must be wider than the cream shaft');
assert.ok(bone.w > 0 && bone.h > 0, 'bone text needs a box');
assert.ok(bone.w <= 200 + 40, `bone text overflowed its maxWidth: ${bone.w}`);
assert.strictEqual(bone.lines, 1, 'a short word should set on one line');

// deterministic: the jitter must not move between renders
assert.deepStrictEqual(boneText('Grounded', 29, 200), bone, 'bone jitter must be deterministic');

// long text wraps instead of overflowing
const wrapped = boneText('Complete habits and affirmation: earn 50 pts', 13, 240);
assert.ok(wrapped.lines > 1, 'a long rule should wrap');
assert.ok(wrapped.w <= 240 + 40, `wrapped bone text overflowed: ${wrapped.w}`);
assert.ok(wrapped.h > bone.h / 2, 'wrapped text needs height for its lines');

// unknown characters must not throw or produce NaN in the path data
const odd = boneText('50% ~ done *', 14, 200);
assert.ok(!/NaN/.test(odd.shaftA + odd.shaftB + odd.knuckleA), 'no NaN in bone paths');

// ── cloud lettering ────────────────────────────────────────────────────────
const short = cloudTextPuffs('Stay the course', 340);
assert.ok(short.d.length > 0, 'cloud text must produce a path');
assert.ok(!/NaN/.test(short.d), 'no NaN in cloud path');
assert.ok(short.height > 0, 'cloud text needs a height');
assert.strictEqual(short.cap, 30, 'a short phrase should keep the full cap height');

// cap height auto-fits: a longer affirmation sets smaller, within maxLines
const long = cloudTextPuffs('I am becoming the person who keeps his word to himself.', 340);
assert.ok(long.cap < short.cap, 'a long phrase must shrink its cap height');
assert.ok(long.lines <= 2, `default maxLines is 2, got ${long.lines}`);

const tall = cloudTextPuffs('I am becoming the person who keeps his word to himself.', 260, {
  capMax: 21,
  capMin: 9,
  maxLines: 3,
});
assert.ok(tall.lines <= 3, `maxLines 3 not respected, got ${tall.lines}`);
assert.ok(tall.cap >= 9, 'cap must never go below capMin');

// empty input renders nothing rather than an empty box
assert.strictEqual(cloudTextPuffs('', 300).empty, true, 'empty text must report empty');
assert.strictEqual(cloudTextPuffs('   ', 300).empty, true, 'whitespace-only text must report empty');

// a word too long for the line still gets laid out rather than dropped
const unbreakable = cloudTextPuffs('Supercalifragilistic', 120);
assert.ok(unbreakable.d.length > 0, 'an unbreakable word must still render');

console.log('earth lettering: all checks passed');
