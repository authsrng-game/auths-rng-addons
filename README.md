# auths-rng-addons

Community and official addons for auth's RNG. Open a PR to get your own addon into the addons store!

**Start here > [docs/README.md](./docs/README.md)**

Addons run with full access to the page, there's no sandbox. Read
[docs/security-guidelines.md](./docs/security-guidelines.md) before writing anything you intend to
submit; it explains what gets an automatic CI rejection and what human reviewers are actually checking
for.

## Quick links

- [Getting started](./docs/getting-started.md) - write your first addon
- [manifest.json schema](./docs/manifest-schema.md)
- [API reference](./docs/api-reference.md) - what your addon can safely read
- [Permissions](./docs/permissions.md)
- [Security guidelines](./docs/security-guidelines.md)
- [Submission process](./docs/submission-process.md)
- [Worked example](./docs/examples/session-stats.md) - an annotated, real, published addon that you can use as an example
- [FAQ](./docs/faq.md)

## Repo structure

- `submissions/` - where you add your addon as a PR (`submissions/<your-id>/`)
- `bundles/` - published, live addons (maintainer-only, gated by CODEOWNERS)
- `ci/` - automated validation run on every submission PR
- `Documentation/` - the documentation linked above