# Example: session stats

This is the first addon published on the platform, used to prove the pipeline end-to-end. Full source
lives at `bundles/session-stats/1.0.0/addon.js`; annotated below.

```js
(function () {
```
Every addon starts with this. `manifest.json` declares `permissions: ["readSave"]`.

```js
	const PANEL_ID = 'addon-session-stats-panel';
	if (document.getElementById(PANEL_ID)) return;
```
Guards against double-injection if the same addon somehow gets loaded twice in one session (e.g. during
a version swap). Cheap and worth doing in any addon that creates DOM elements.

```js
	function safeRead(fn, fallback) {
		try {
			const v = fn();
			return v === undefined ? fallback : v;
		} catch (_) {
			return fallback;
		}
	}
```
This pattern is recommended for anything reading from [api-reference.md](../api-reference.md) globals.
If the game's internals ever rename something not on the stable list, your addon degrades to showing a
fallback value instead of throwing and breaking the page for the player.

```js
	function update() {
		const pts = safeRead(() => points, 0);
		...
	}
	update();
	setInterval(update, 1000);
```
Polls once a second rather than trying to hook into the game's own update cycle, since there's no
event system exposed for "points changed"... see [api-reference.md](../api-reference.md) for what is
and isn't available. Polling is the simplest reliable approach for most read-only addons.

Full permission declaration matches actual behavior exactly: it only reads state, never writes
anything, uses no audio, no theme changes, no network. That's why its manifest lists only `readSave`!