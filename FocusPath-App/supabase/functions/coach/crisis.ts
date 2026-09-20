// Deterministic crisis short-circuit for the coach.
//
// This runs BEFORE the model and replaces its reply entirely. The system prompt
// also carries a safety section, but a prompt is guidance, not a guarantee —
// this is the part that cannot be talked around.
//
// The bias is deliberate and asymmetric. A false positive shows someone a
// crisis line they did not need, which is a poor experience. A false negative
// sends someone who is planning to hurt themselves to a vaping coach. So a
// borderline phrase is treated as a crisis.
//
// The exception is the handful of figures of speech that are genuinely common
// in a quit-vaping app — "dying for a cigarette", "this craving is killing me".
// Those are stripped out before the crisis patterns run, because they would
// otherwise fire constantly and train people to ignore the response. Stripping
// rather than short-circuiting is the point: "this craving is killing me, and I
// plan to overdose" is still a crisis.
//
// Kept separate from index.ts so it can be exercised by
// scripts/check-crisis-patterns.js without standing up the Edge Function.

/**
 * Idioms about craving, not about self-harm. Stripped from the text before the
 * crisis patterns run. The /g flag is for replace-all: never use these with
 * .test(), which is stateful on a global regex.
 */
const FIGURES_OF_SPEECH: RegExp[] = [
  /\b(dying|die|dyin)\s+for\s+(a|an|one|some|another)\b/g,
  /\b(could|would|'?d)\s+kill\s+for\b/g,
  /\bkill(ing)?\s+for\s+(a|an|one|some|another)\b/g,
  /\b(is|are|was|were)\s+killing\s+me\b/g,
  /\bkill(ing)?\s+my\s?self\s+(with|by|over)\s+(a\s+|these\s+|the\s+)?(vape|vaping|smok|cigarette|nicotine|juul|pod)/g,
  /\bdead\s+(tired|serious|set|weight|end)\b/g,
  /\bdying\s+to\s+(know|hear|see|try|quit|stop)\b/g,
];

/**
 * Explicit statements, stated intent, and named plans or methods.
 *
 * Phrases that are merely bleak about quitting — "I can't do this anymore",
 * "I want this craving to stop" — are deliberately NOT here. They are the
 * ordinary vocabulary of withdrawal, and matching them would stop the coaching
 * conversation several times a week for the wrong reason.
 */
const CRISIS_PATTERNS: RegExp[] = [
  // explicit
  /\bsuicid(e|al)\b/,
  /\bkill(ing)?\s+my\s?self\b/,
  /\b(end|ending)\s+(it all|it|my life)\b/,
  /\btake\s+my\s+own\s+life\b/,
  /\bself[-\s]?harm/,
  /\b(hurt|harm|cut|cutting)(ting)?\s+my\s?self\b/,

  // stated intent, or wanting not to exist
  /\b(want|wanna|wish|going|plan|planning|ready|about)\s+to\s+die\b/,
  /\b(don'?t|do not|no longer)\s+want\s+to\s+(live|be here|be alive|exist|wake up|go on)\b/,
  /\bwant\s+it\s+all\s+to\s+(stop|end|be over)\b/,
  /\bwant\s+to\s+(disappear|vanish|not exist)\b/,
  /\bwish(ed)?\s+i\s+(was|were)\s+(dead|gone|never born)\b/,
  /\bbetter\s+off\s+(dead|without me|if i (was|were) (dead|gone))\b/,
  /\bno\s+(reason|point)\s+(to|in)\s+(liv|go|be|carry|keep)/,
  /\bnothing\s+(left\s+)?to\s+live\s+for\b/,
  /\bcan'?t\s+go\s+on\b/,
  /\bdon'?t\s+want\s+to\s+be\s+here\s+anymore\b/,

  // plans and methods
  /\bplan(ning|ned)?\s+to\s+(kill|hurt|end|overdose|die)/,
  /\boverdos(e|ing)\b/,
  /\b(take|taking|took|swallow|swallowing)\w*\s+(all\s+)?(my|the)\s+(pills|meds|medication)\b/,
  /\bslit(ting)?\s+(my\s+)?wrist/,
  /\bhang(ing)?\s+my\s?self\b/,
  /\b(shoot|shooting)\s+my\s?self\b/,
  /\bjump(ing)?\s+(off|in front of)\b/,
  /\b(suicide|goodbye|farewell)\s+(note|letter)\b/,
];

/**
 * Lower-cases, folds the curly apostrophes phone keyboards insert by default
 * (without this, "don’t want to be here" misses every `don't` pattern), and
 * collapses whitespace so a line break cannot split a phrase.
 */
export function normalize(text: string): string {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCrisis(text: string): boolean {
  const t = normalize(text);
  if (!t) return false;
  const withoutIdioms = FIGURES_OF_SPEECH.reduce((s, p) => s.replace(p, ' '), t);
  return CRISIS_PATTERNS.some((p) => p.test(withoutIdioms));
}

export const CRISIS_REPLY =
  "I want to stop and say something directly: what you've written sounds bigger " +
  "than quitting vaping, and I'm not the right help for it.\n\n" +
  'Please talk to someone now — call or text 988 (US), 116 123 (UK Samaritans), ' +
  'or 13 11 14 (Australia). They are free, confidential, and open right now.\n\n' +
  "If you're in immediate danger, call your local emergency number.";
