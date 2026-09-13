#!/usr/bin/env node
// Prints the facts you need to pick the right Expo start mode, and checks the
// Expo CLI login state.
//
// Note: os.networkInterfaces() only lists adapters that are up with a usable
// address, so an idle McAfee/VPN adapter simply will not appear here.
//
// Deliberately does NOT probe ngrok and print a verdict: on this laptop's
// campus/library Wi-Fi, both `curl https://connect.ngrok-agent.com` and
// `Test-NetConnection ... -Port 443` report unreachable while
// `expo start --tunnel` connects fine. Those probes give false negatives,
// so the only honest test is running the tunnel and reading its output.

const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');

const VPN_HINTS = ['vpn', 'tap', 'tun', 'wireguard', 'nord', 'mcafee', 'proton'];

function ipv4Interfaces() {
  const out = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family !== 'IPv4' || a.internal) continue;
      out.push({ name, address: a.address });
    }
  }
  return out;
}

// 169.254.x.x means the adapter never got a real address - it is not carrying traffic.
const isLinkLocal = (ip) => ip.startsWith('169.254.');

function portFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '0.0.0.0');
  });
}

// Reads files directly rather than shelling out to `npx expo whoami`,
// which takes several seconds.
const { cliUsername, easProjectId, problems } = require('./expo-go-readiness');

(async () => {
  const all = ipv4Interfaces();
  const real = all.filter((i) => !isLinkLocal(i.address));
  const vpns = all.filter((i) => VPN_HINTS.some((h) => i.name.toLowerCase().includes(h)));
  const free = await portFree(8081);
  const user = cliUsername();
  const projectId = easProjectId();
  const blockers = problems();

  console.log('\nExpo dev-server check');
  console.log('=====================\n');

  if (real.length === 0) {
    console.log('Laptop LAN IP : none found - you are not on a network.');
  } else {
    real.forEach((i, n) => {
      console.log(`${n === 0 ? 'Laptop LAN IP ' : '              '}: ${i.address}  (${i.name})`);
      console.log(`${' '.repeat(14)}  exp://${i.address}:8081`);
    });
  }

  console.log(`Port 8081     : ${free ? 'free' : 'IN USE - close the other Expo terminal first'}`);

  if (vpns.length === 0) {
    console.log('VPN adapters  : none active');
  } else {
    vpns.forEach((v) => {
      const active = !isLinkLocal(v.address);
      console.log(`VPN adapters  : ${v.name} ${active ? `ACTIVE (${v.address}) - turn it off, it blocks LAN mode` : '(idle, fine)'}`);
    });
  }

  console.log(`Expo CLI login: ${user ? `signed in as ${user}` : 'NOT signed in'}`);
  console.log(`EAS project ID: ${projectId ?? 'NOT set in app.json'}`);

  if (blockers.length > 0) {
    console.log('');
    console.log('  >> Expo Go on iOS will refuse to open this project until both');
    console.log('     of these are fixed:');
    blockers.forEach((b, i) => console.log(`       ${i + 1}. ${b.what}
          fix: ${b.fix}`));
    console.log('     Then sign in on Expo Go with the SAME account.');
  }

  console.log(`
What to run
-----------
1. npm start        LAN mode. Fastest. Works when the network lets your
                    phone reach your laptop directly.

2. npm run tunnel   Use this on public, campus or library Wi-Fi. Traffic
                    goes out through ngrok, so it does not matter if the
                    network blocks phone-to-laptop traffic. Slower reloads.
                    It is working when you see "Tunnel ready."

3. Phone hotspot    If 1 and 2 both fail: turn on your phone's hotspot,
                    connect the laptop to it, then run npm start.

If Metro throws a weird module error rather than a network error, that is a
broken node_modules, not the Wi-Fi. Run: npm run reinstall
`);
})();
