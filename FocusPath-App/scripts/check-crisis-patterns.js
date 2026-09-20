#!/usr/bin/env node
// Self-check for the coach's deterministic crisis short-circuit.
//
//   node scripts/check-crisis-patterns.js
//
// The Edge Function runs on Deno, which is not installed here, so the module is
// transpiled with the project's TypeScript and exercised in Node. It has no
// imports of its own precisely so this works.
//
// Two lists, and the second matters as much as the first: a matcher that fires
// on "this craving is killing me" trains people to scroll past the one response
// that has to land.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'supabase', 'functions', 'coach', 'crisis.ts');
const { outputText } = ts.transpileModule(fs.readFileSync(SRC, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const mod = { exports: {} };
new Function('module', 'exports', outputText)(mod, mod.exports);
const { isCrisis, CRISIS_REPLY } = mod.exports;

// Must short-circuit the model.
const CRISIS = [
  'I have a plan to overdose tonight',
  'i want to kill myself',
  "I've been thinking about suicide",
  'I feel suicidal',
  'I want to end it all',
  'thinking about ending my life',
  'I want to die',
  'I am going to die tonight by my own hand',
  "I don't want to be here anymore",
  'I don’t want to be here anymore', // curly apostrophe, the phone keyboard default
  'i dont want to live',
  'everyone would be better off without me',
  "I'd be better off dead",
  'I wish I was dead',
  'there is no reason to live',
  'nothing left to live for',
  'I want to hurt myself',
  'thinking about self harm',
  'I self-harm when it gets bad',
  'I might cut myself',
  'planning to kill myself',
  'I am going to take all my pills',
  'I swallowed all my meds',
  'thinking about slitting my wrists',
  'I want to hang myself',
  'I wrote a goodbye letter',
  'I left a suicide note',
  'I want to jump off the bridge',
  "I can't go on",
  'I want it all to stop',
  'I want to disappear forever',
  'I WANT TO KILL MYSELF', // case
  'i   want\nto   die', // whitespace and newlines

  // An idiom in the same message must not suppress the crisis language after it.
  'This craving is killing me, and I plan to overdose',
  "I'm dying for a vape and I want to kill myself",
];

// Must NOT short-circuit: the ordinary vocabulary of quitting.
const NOT_CRISIS = [
  'I am dying for a cigarette',
  "I'm dying for a vape right now",
  'I could kill for a smoke',
  'this craving is killing me',
  'these cravings are killing me',
  'vaping is killing me slowly',
  'I know I am killing myself with these vapes',
  'I was dead tired all day',
  "I'm dying to know how long withdrawal lasts",
  'I relapsed and I feel terrible about it',
  "I can't do this anymore, day 3 is brutal",
  'I want this craving to stop',
  'my chest hurts when I breathe',
  'how many days until the cravings end',
  'I want to quit for good',
  'what happens to my lungs after I stop',
  '',
  '   ',
];

let failures = 0;
for (const text of CRISIS) {
  if (!isCrisis(text)) {
    console.error(`  MISSED (should be crisis): ${JSON.stringify(text)}`);
    failures++;
  }
}
for (const text of NOT_CRISIS) {
  if (isCrisis(text)) {
    console.error(`  FALSE POSITIVE (should not be crisis): ${JSON.stringify(text)}`);
    failures++;
  }
}

assert.ok(/988/.test(CRISIS_REPLY), 'the crisis reply must carry a crisis line');
assert.strictEqual(isCrisis(null), false, 'null input must not throw');
assert.strictEqual(isCrisis(undefined), false, 'undefined input must not throw');

if (failures) {
  console.error(`\ncrisis patterns: ${failures} case(s) wrong\n`);
  process.exit(1);
}
console.log(`crisis patterns: ${CRISIS.length} crisis + ${NOT_CRISIS.length} benign cases all correct`);
