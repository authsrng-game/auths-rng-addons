# Security guidelines

Read this before writing anything you intend to submit. Addons run with full page access — same as
the game's own code, same as if the player pasted your JS into their devtools console themselves. There
is no sandbox. Review is the only thing standing between a bad submission and every installing player's
account and browser.

## Automatically rejected patterns

CI scans your entry file for these and fails the build if any appear:

- `fetch(`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon` - no network requests, period
- `eval(`, `new Function(` - no dynamic code execution
- `localStorage`, `sessionStorage`, `document.cookie`, `indexedDB` - no storage access of any kind
- `importScripts` - no loading additional scripts
- the literal string `authToken`, or the domains `accounts.authsrng.xyz` / `backup.authsrng.xyz`
- `navigator.credentials`

If your addon has a legitimate reason to do something that looks like one of these, it almost certainly
doesn't! These are blocked because there is no legitimate addon use case for them. If you genuinely
believe you have one, open an issue and discuss it before submitting a PR that tries to work around the
filter; obfuscating around this list is treated as a deliberate security violation, not a bug to fix.

## Required structure

Your entire entry file must be wrapped in exactly one top-level IIFE:

```js
(function () {
  // everything goes here
})();
```

CI checks for this. It doesn't prevent you from writing to `window.something` from inside the IIFE, but
it keeps your addon from leaking variables into global scope where they could silently collide with the
game's own code or another addon's.

## What human reviewers are actually checking for

The automated checks catch the obvious stuff. A reviewer is separately looking for:

- code that does something different than what the PR description and declared permissions claim
- obfuscated or minified code that's hard to read (a legitimate addon has no reason to obscure itself)
- logic that only activates conditionally in a way designed to evade review (e.g. "after 30 days" or
  "after 10,000 rolls" or a sleeper payload)
- writes to game state (`points`, save data, etc.) beyond what the addon's stated purpose and declared
  permissions justify
- global variable or `window.*` writes that could collide with the game or other addons

## Version updates get the same scrutiny as new submissions

A "minor bugfix" PR to an existing addon is reviewed exactly as carefully as day-one code. Prior
approval of an earlier version is not a pass for anything after it.

## If you find a real vulnerability

Do not open a public PR demonstrating it. Contact a maintainer directly first.