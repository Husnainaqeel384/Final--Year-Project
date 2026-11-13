import dns from 'node:dns';
import https from 'node:https';
import net from 'node:net';

// Webhook addresses come from users. Without this list, one could point the
// server at internal services or cloud metadata and read the response status.
const blocked = new net.BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]) {
  blocked.addSubnet(address, prefix, 'ipv4');
}
for (const [address, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
]) {
  blocked.addSubnet(address, prefix, 'ipv6');
}

export function isPublicAddress(address) {
  const family = net.isIP(address);
  if (family === 0) return false;
  return !blocked.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

/** Used at connect time, so a hostname cannot pass validation and then re-point to a private IP. */
function publicOnlyLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error);
    if (addresses.length === 0 || !addresses.every(({ address }) => isPublicAddress(address))) {
      return callback(new Error('Address is not publicly routable'));
    }
    if (options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
}

export function assertSafeWebhookUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:' || (url.port && url.port !== '443') || url.username || url.password) {
    throw new Error('Webhook URLs must use https on the standard port');
  }
  // Literal addresses skip DNS, so the connection-time check would never see them.
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && !isPublicAddress(host)) {
    throw new Error('Webhook URLs must be publicly reachable');
  }
  return url;
}

/** POSTs JSON and resolves with the status code. Redirects are not followed. */
export function postJson(rawUrl, body, headers = {}) {
  const url = assertSafeWebhookUrl(rawUrl);
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: 'POST',
        lookup: publicOnlyLookup,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'BudgetBook-Webhook/2.0',
          ...headers,
        },
      },
      (response) => {
        response.resume();
        resolve(response.statusCode);
      },
    );
    request.on('timeout', () => request.destroy(new Error('Request timed out')));
    request.on('error', reject);
    request.end(body);
  });
}
