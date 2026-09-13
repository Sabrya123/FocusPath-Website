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

const ROOT = path.resolve(__dirname, '..');

function cliUsername() {
  try {
    const raw = fs.readFileSync(path.join(os.homedir(), '.expo', 'state.json'), 'utf8');
    return JSON.parse(raw)?.auth?.username ?? null;
  } catch {
    return null;
  }
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

module.exports = { cliUsername, easProjectId, problems };
