# Permissions

Permissions are declared in `manifest.json` as an array of strings. They are shown to the player before
install as a description of what your addon does. **They are not enforced at runtime!** - See
[security-guidelines.md](./security-guidelines.md) for what that means for review. Declare every
permission your addon's actual behavior requires, honestly, even though nothing technically forces you
to.

| permission | shown to player as | declare this if your addon... |
|---|---|---|
| `readSave` | "reads your roll history, inventory, and stats to display them" | reads any of `points`, `totalRolls`, `inventoryData`, `rarities`, `achievementsUnlocked`, `globalLuckMultiplier`, or calls `Plush.denomOf` |
| `modifySave` | "can change settings or save values on your behalf" | writes to any setting that affects gameplay behavior, e.g. `window.autoSellThreshold` |
| `theme` | "modifies colors, fonts, and layout styling" | changes CSS custom properties, injects `<style>` tags, or otherwise alters visual appearance |
| `audio` | "plays custom audio" | creates and plays `Audio` objects or otherwise produces sound |
| `points` | "can deduct points from your balance" | subtracts from or otherwise spends the player's `points` |

An addon with no special behavior can declare `"permissions": []` - this will show the player
"this addon does not request any special permissions" in the install dialog.

Misdeclaring permissions (either omitting one your addon actually uses, or claiming ones it doesn't) is
grounds for a submission being rejected or a published addon being pulled! It's a trust violation even
though there's no technical enforcement to catch it automatically.