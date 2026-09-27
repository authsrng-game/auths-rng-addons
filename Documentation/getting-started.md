# Getting started

An addon is a single JavaScript file that runs inside auth's RNG, with the same access to the page as
the game's own code. There is no sandbox, no restricted API surface, no permission enforcement at
runtime, so permissions are a label you choose so players know what to expect, not a technical boundary.
This means addon review is taken seriously; see [security-guidelines.md](./security-guidelines.md)
before you write anything you plan to submit!

## Minimum addon

Every addon is one `.js` file, wrapped in a single IIFE (this is enforced by CI):

```js
(function () {
  console.log('hello from my addon');
})();
```

That's a complete, valid addon. It does nothing useful yet, but it will pass validation and load.

## Reading game state

Your addon runs after the game's own scripts, so it has access to the same variables `main.js` uses.
See [api-reference.md](./api-reference.md) for the full list of what's safe to read and what's
considered stable (won't be silently renamed later). A minimal useful addon:

```js
(function () {
  console.log('you have', points, 'points and', totalRolls, 'rolls');
})();
```

## Manifest

Every addon needs a `manifest.json` next to its entry file:

```json
{
  "id": "my-addon",
  "version": "1.0.0",
  "name": "my addon",
  "author": "your-authsrng-username",
  "permissions": ["readSave"],
  "entry": "addon.js"
}
```

Full field-by-field breakdown: [manifest-schema.md](./manifest-schema.md).

## Testing locally

There is currently no local test harness. The only way to see your addon run against the real game is
to get it published. Write carefully, keep it small, and read
[security-guidelines.md](./security-guidelines.md) closely, since a mistake here runs directly in every
installing player's browser with full access to their session.

## Submitting

See [submission-process.md](./submission-process.md) for the exact steps - briefly: fork
`auths-rng-addons`, add your files under `submissions/<your-id>/`, open a PR, wait for CI + human
review, and once merged your addon still needs a maintainer to manually publish it to `bundles/`
before it appears in the store.