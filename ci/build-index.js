const fs = require("fs");
const path = require("path");

function compareSemver(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

const bundlesDir = path.join(__dirname, "..", "bundles");
const outPath =
  process.argv[2] || path.join(__dirname, "..", "deploy", "index.json");

const entries = [];

if (fs.existsSync(bundlesDir)) {
  const ids = fs
    .readdirSync(bundlesDir)
    .filter((f) => fs.statSync(path.join(bundlesDir, f)).isDirectory());

  ids.forEach((id) => {
    const idDir = path.join(bundlesDir, id);
    const versions = fs
      .readdirSync(idDir)
      .filter((f) => fs.statSync(path.join(idDir, f)).isDirectory());
    if (!versions.length) return;

    const latest = versions.sort(compareSemver).pop();
    const manifestPath = path.join(idDir, latest, "manifest.json");
    if (!fs.existsSync(manifestPath)) return;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    entries.push({
      id: manifest.id,
      version: manifest.version,
      name: manifest.name,
      author: manifest.author,
      permissions: manifest.permissions,
      entry: manifest.entry,
      versions: versions.sort(compareSemver),
    });
  });
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(entries, null, 2));
console.log("wrote", entries.length, "addon entries to", outPath);
