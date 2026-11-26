const { isIP } = require('node:net');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { withDangerousMod } = require('expo/config-plugins');

// This opt-in overlay is compiled into debug APKs only and trusts a single CA at one address.
module.exports = ({ config }) => {
  const root = process.env.PARKFAIR_DEBUG_TLS_CA;
  const host = process.env.PARKFAIR_DEBUG_TLS_HOST;
  if (!root && !host) return config;
  if (!root || isIP(host) !== 4 || !/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
    throw new Error('Set PARKFAIR_DEBUG_TLS_CA and PARKFAIR_DEBUG_TLS_HOST to a development CA and private IPv4 address.');
  }
  if (process.env.EAS_BUILD) throw new Error('Local debug TLS is for workstation builds.');
  const cert = readFileSync(root, 'utf8');
  if (!/^-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----\s*$/.test(cert)) throw new Error('Provide a PEM CA certificate.');
  return withDangerousMod(config, ['android', config => {
    const debug = join(config.modRequest.platformProjectRoot, 'app', 'src', 'debug');
    mkdirSync(join(debug, 'res', 'raw'), { recursive: true });
    mkdirSync(join(debug, 'res', 'xml'), { recursive: true });
    writeFileSync(join(debug, 'res', 'raw', 'parkfair_lan_ca.pem'), cert);
    writeFileSync(join(debug, 'res', 'xml', 'parkfair_debug_tls.xml'),
      '<network-security-config><domain-config cleartextTrafficPermitted="true"><domain>127.0.0.1</domain>' +
      '<domain>localhost</domain></domain-config><domain-config cleartextTrafficPermitted="false"><domain>' + host +
      '</domain><trust-anchors><certificates src="system"/><certificates src="@raw/parkfair_lan_ca"/>' +
      '</trust-anchors></domain-config></network-security-config>');
    const manifest = join(debug, 'AndroidManifest.xml');
    const xml = readFileSync(manifest, 'utf8');
    if (!xml.includes('@xml/parkfair_debug_tls')) {
      if (!xml.includes('<application')) throw new Error('Missing generated debug application manifest.');
      writeFileSync(manifest, xml.replace('<application', '<application android:networkSecurityConfig="@xml/parkfair_debug_tls"'));
    }
    return config;
  }]);
};
