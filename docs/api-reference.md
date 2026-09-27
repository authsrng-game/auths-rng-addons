# API reference

Your addon executes as a plain `<script>` tag injected after the game's own scripts have already run.
It has access to every global variable and function the game itself uses. This document lists the ones
that are considered part of the addon-facing surface - meaning changes to them will be called out in
addon-facing release notes before they happen. Anything not listed here may still technically be
accessible, but is not guaranteed to remain named the same way release to release. Relying on
unlisted internals is at your own risk.

## Reading state

| name | type | description |
|---|---|---|
| `points` | number | the player's current point balance |
| `totalRolls` | number | total lifetime rolls |
| `globalLuckMultiplier` | number | the current effective luck multiplier, all sources combined |
| `inventoryData` | `Map<string, {rarityObj, count}>` | keyed by rarity name. `rarityObj` has `.name` and `.chance` |
| `rarities` | array | the full static list of rarity definitions, each with `.name` and `.chance` |
| `achievementsUnlocked` | `Set<string>` | achievement ids the player has unlocked |
| `Plush.denomOf(rarityObj)` | function | returns the human-readable denominator (e.g. `1000` for a 1/1000 rarity) — use this rather than reading `.chance` directly, since the underlying chance representation may change |

## Formatting helpers

| name | description |
|---|---|
| `window.formatNum(n)` | formats a number the way the rest of the UI does (abbreviates large numbers unless the player has "raw numbers" enabled) |
| `window.formatMult(n)` | same, formatted as a multiplier |

## Notifications

| name | description |
|---|---|
| `window.addNotification(text)` | adds an entry to the player's notification center. Use this instead of `alert()` or building your own popup, it's the existing, expected UX. |

## What you do NOT have

There is no `AddonAPI` object, no message-passing layer, no permission enforcement. Everything above is
just... the actual variable, directly. This also means nothing stops you from writing to `points`
directly instead of reading it, don't. Modifying game state you didn't declare a `modifySave` or
`points` permission for is a security-guidelines violation even though nothing technically prevents it.

## Stability

This list will grow as the game's own code exposes more, but existing entries won't be removed or
repurposed without notice. If you need something not listed here, open an issue describing the use
case rather than reaching for an unlisted internal, it may get added! :eyes: