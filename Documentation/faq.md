# FAQ

**My addon works when I test it, but the CI check fails on IIFE wrapping.**
Make sure the *entire* file is inside one `(function(){ ... })();` - including any code before your
first function definition. A stray top-level `const` or comment before the wrapper will fail the regex
check. See [security-guidelines.md](./security-guidelines.md).

**Can I make network requests to my own server?**
No. This is blocked outright, not just discouraged! See the forbidden patterns list. There is
currently no sanctioned way for an addon to talk to an external service.

**Can I store addon settings so they persist between sessions?**
Not currently.. `localStorage`/`sessionStorage` access is blocked. If you have a real use case, open an
issue rather than trying to work around the filter.

**My addon needs to read something that isn't in api-reference.md.**
Open an issue describing what you need and why before submitting a PR that reaches for an undocumented
internal. It might get added to the stable surface; it might not be something that should be exposed at
all.

**How long does review take?**
No fixed timeline. Simpler, smaller, more clearly-scoped addons get through faster because there's less
to verify.

**I found a bug in an already-published addon that isn't mine.**
Open an issue on this repo, or if it's a security issue, contact a maintainer directly rather than
filing publicly.