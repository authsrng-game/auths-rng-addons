# manifest.json schema

Every field is required unless noted.

| field | type | rules |
|---|---|---|
| `id` | string | lowercase letters, numbers, hyphens only, 3–40 chars. Must exactly match your submission folder name. Once published, this `id` is permanently yours, a future version bump must come from the same `author`. |
| `version` | string | strict semver `x.y.z`. Each new submission for an existing `id` must have a version strictly greater than the latest published one. |
| `name` | string | display name shown in the store. No format restriction beyond what content-safety review allows. |
| `author` | string | your auth's RNG account username. Must match the account you actually play on! This is how ownership of an `id` is enforced and we WILL check if the account actually exists or not. Format: 3–20 chars, letters/numbers/underscore/hyphen. |
| `permissions` | array of strings | see [permissions.md](./permissions.md) for the full list and what each one means. An empty array (`[]`) is valid if your addon needs none. |
| `entry` | string | filename of your addon's single JS file, e.g. `"addon.js"`. Must exist in the same folder as the manifest. No path traversal (`../`) allowed. |

## Example

```json
{
  "id": "roll-analytics",
  "version": "2.0.4",
  "name": "roll analytics",
  "author": "someauthor",
  "permissions": ["readSave", "theme"],
  "entry": "addon.js"
}
```

## Folder contents

Your submission folder may contain **only** `manifest.json` and the file named in `entry`. Nothing
else, no assets, no extra scripts, no README. CI rejects submissions with additional files. If your
addon needs a sound file or image, host it externally and reference it by URL from within your addon
code (subject to whatever your declared permissions and the security guidelines allow).