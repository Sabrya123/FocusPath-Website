// Shared check for the two things Expo Go on iOS needs before it will open
// this project, since SDK 57 made login mandatory.
//
// Both are required, and the second one is easy to miss:
//
//   1. The Expo CLI is signed in  (~/.expo/state.json has an `auth` key).
//   2. app.json has expo.extra.eas.projectId.
//
// Why (2): @expo/cli's getExpoRootDevelopmentCodeSigningInfoAsync reads
// exp.extra.eas.projectId and returns null when it is missing. With no code
// signing info, getScopeKeyAsync falls back to `@anonymous/<slug>-<uuid>`,
// and a signed-in Expo Go rejects an anonymously scoped manifest. So logging
// in without an EAS project ID still fails, with the same phone-side error.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// Invoked through node rather than node_modules/.bin/expo: the shim is a .cmd
// on Windows, and spawning one without a shell throws on current Node.
const EXPO_CLI = path.join(ROOT, 'node_modules', 'expo', 'bin', 'cli');

/** The username cached in ~/.expo/state.json. Cheap, but see verifiedUsername. */
function cachedUsername() {
  try {
    const raw = fs.readFileSync(path.join(os.homedir(), '.expo', 'state.json'), 'utf8');
    return JSON.parse(raw)?.auth?.username ?? null;
  } catch {
    return null;
  }
}

/**
 * Ask the CLI who it actually is.
 *
 * state.json keeps the username after the session behind it has been revoked or
 * has expired — "Log out of all other sessions" on expo.dev leaves the cached
 * name sitting there — so reading the file alone will call a dead credential
 * signed in, and the phone then fails with nothing here having warned about it.
 *
 * Returns the username, `null` when the CLI says it is not logged in, or
 * `undefined` when the question could not be answered. Those last two are NOT
 * the same thing. `expo whoami` also exits non-zero when it cannot reach the
 * API at all, and an earlier session of this project was sent chasing a
 * firewall by trusting exactly that kind of false negative — so being offline
 * must not render as "your login is gone, sign in again".
 */
function verifiedUsername() {
  const res = spawnSync(process.execPath, [EXPO_CLI, 'whoami'], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 20000,
    windowsHide: true,
  });
  if (res.error || typeof res.status !== 'number') return undefined;

  // eslint-disable-next-line no-control-regex
  const out = `${res.stdout || ''}${res.stderr || ''}`.replace(/\[[0-9;]*m/g, '').trim();
  if (/not logged in/i.test(out)) return null;
  if (res.status !== 0) return undefined; // offline, or some other failure to ask
  return out.split('\n').map((l) => l.trim()).filter(Boolean).pop() || undefined;
}

let checked;
function cliUsername() {
  if (checked !== undefined) return checked;
  const cached = cachedUsername();
  // No credential on disk at all: nothing to verify, and no reason to pay for
  // starting the CLI to be told so.
  if (!cached) return (checked = null);
  const live = verifiedUsername();
  checked = live === undefined ? cached : live;
  return checked;
}

function easProjectId() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8');
    return JSON.parse(raw)?.expo?.extra?.eas?.projectId ?? null;
  } catch {
    return null;
  }
}

function problems() {
  const out = [];
  if (!cliUsername()) {
    out.push({
      what: 'Expo CLI is not signed in.',
      fix: 'npx expo login',
    });
  }
  if (!easProjectId()) {
    out.push({
      what: 'No EAS project ID in app.json (expo.extra.eas.projectId).',
      fix: 'npx eas-cli@latest init',
    });
  }
  return out;
}

module.exports = { cliUsername, cachedUsername, verifiedUsername, easProjectId, problems };
