# Submission process

1. **Fork or branch** the `auths-rng-addons` repository.
2. **Create your folder**: `submissions/<your-addon-id>/`, matching the `id` in your manifest exactly.
3. **Add exactly two files**: `manifest.json` and your entry file (e.g. `addon.js`). Nothing else.
4. **Open a PR** into `main`. The PR template asks for your auth's RNG username, addon id, and the
   permissions you're requesting and why. Fill it out honestly, please.
5. **Automated validation runs** (`validate-addon.yml`) — checks manifest schema, IIFE wrapping,
   forbidden patterns, and version/id uniqueness. This must pass before human review begins in earnest.
6. **Human review**. A maintainer reads your actual code against
   [security-guidelines.md](./security-guidelines.md). This can take a while, there's no SLA.
7. **Merge**. Once merged, your code is in `main` under `submissions/`, but **this does not make it
   live**. Merging and publishing are deliberately separate steps.
8. **Publishing**. A maintainer manually copies your submission into `bundles/<id>/<version>/`, which
   goes through its own PR and review (this is gated separately, since `bundles/` is what the live store
   actually reads from). Once that PR merges and a maintainer redeploys, your addon appears in the
   store's index and becomes installable.

## Updating a published addon

Same process, new PR, bumped `version` in your manifest. The previous version stays in `bundles/`
unless a maintainer removes it! The store always resolves to the latest version.

## If your addon gets removed

If a maintainer pulls your addon after publishing (policy violation, security issue, or otherwise),
installed players get a one-time notification that it's no longer available, and it's silently dropped
from their installed list on their next visit. There's currently no in-band appeal process... contact a
maintainer directly.