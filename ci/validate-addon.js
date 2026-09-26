const fs = require('fs');
const path = require('path');

const KNOWN_PERMS = ['readSave', 'modifySave', 'audio', 'theme', 'points'];
const FORBIDDEN_PATTERNS = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bimportScripts\b/,
  /\beval\s*\(/,
  /\bnew\s+Function\s*\(/,
  /\bnavigator\.sendBeacon\b/
];

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node validate-addon.js <submission-dir>');
  process.exit(1);
}

const manifestPath = path.join(dir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('missing manifest.json in', dir);
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
  console.error('manifest.json is not valid JSON:', err.message);
  process.exit(1);
}

const required = ['id', 'version', 'name', 'author', 'permissions', 'entry'];
const missing = required.filter((k) => !(k in manifest));
if (missing.length) {
  console.error('manifest missing fields:', missing.join(', '));
  process.exit(1);
}

if (typeof manifest.id !== 'string' || !/^[a-z0-9-]{3,40}$/.test(manifest.id)) {
  console.error('invalid id format, must be lowercase alphanumeric with hyphens, 3-40 chars');
  process.exit(1);
}

if (typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
  console.error('invalid version format, must be semver x.y.z');
  process.exit(1);
}

const submissionDirName = path.basename(dir);
if (submissionDirName !== manifest.id) {
  console.error('submission directory name must match manifest id:', submissionDirName, 'vs', manifest.id);
  process.exit(1);
}

if (typeof manifest.author !== 'string' || !/^[a-zA-Z0-9_-]{3,20}$/.test(manifest.author)) {
  console.error('invalid author field, must match an auth\'s RNG username format');
  process.exit(1);
}

if (!Array.isArray(manifest.permissions)) {
  console.error('permissions must be an array');
  process.exit(1);
}

const badPerms = manifest.permissions.filter((p) => !KNOWN_PERMS.includes(p));
if (badPerms.length) {
  console.error('unknown permissions:', badPerms.join(', '));
  process.exit(1);
}

if (typeof manifest.entry !== 'string' || manifest.entry.includes('..') || path.isAbsolute(manifest.entry)) {
  console.error('invalid entry field');
  process.exit(1);
}

const entryPath = path.join(dir, manifest.entry);
if (!fs.existsSync(entryPath)) {
  console.error('entry file not found:', manifest.entry);
  process.exit(1);
}

const allowedFiles = new Set(['manifest.json', manifest.entry]);
const actualFiles = fs.readdirSync(dir);
const extraFiles = actualFiles.filter((f) => !allowedFiles.has(f));
if (extraFiles.length) {
  console.error('unexpected files in submission, only manifest.json and entry file allowed:', extraFiles.join(', '));
  process.exit(1);
}

const code = fs.readFileSync(entryPath, 'utf8');

if (code.length > 200000) {
  console.error('addon entry file too large, flag for manual review');
  process.exit(1);
}

const hits = FORBIDDEN_PATTERNS.filter((re) => re.test(code));
if (hits.length) {
  console.error('addon entry contains disallowed patterns, flag for manual review:', hits.map(String).join(', '));
  process.exit(1);
}

const bundlesPath = path.join(__dirname, '..', 'bundles', manifest.id);
if (fs.existsSync(bundlesPath)) {
  const publishedVersions = fs.readdirSync(bundlesPath).filter((f) =>
    fs.statSync(path.join(bundlesPath, f)).isDirectory()
  );

  if (publishedVersions.includes(manifest.version)) {
    console.error('version already published, bump version in manifest.json:', manifest.version);
    process.exit(1);
  }

  const publishedManifestPath = path.join(bundlesPath, publishedVersions[0] || '', 'manifest.json');
  if (publishedVersions.length && fs.existsSync(publishedManifestPath)) {
    const publishedManifest = JSON.parse(fs.readFileSync(publishedManifestPath, 'utf8'));
    if (publishedManifest.author !== manifest.author) {
      console.error('addon id already owned by a different author:', publishedManifest.author);
      process.exit(1);
    }
  }

  const latest = publishedVersions.sort(compareSemver).pop();
  if (latest && compareSemver(manifest.version, latest) <= 0) {
    console.error('new version must be greater than latest published version:', latest);
    process.exit(1);
  }
}

console.log('manifest ok:', manifest.id, manifest.version, 'by', manifest.author);

function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}