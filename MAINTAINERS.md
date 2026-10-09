# maintainer runbook

## reviewing a submission

- diff only touches submissions/<id>/ (no edits to other addons or ci files)
- folder contains only manifest.json and the entry file
- declared permissions match what the code actually does
- code is readable, no obfuscation, no delayed or conditional behavior
- overlays use pointer-events: none, input handlers guard against typing in fields
- confirm requested changes are in the actual diff, not just marked resolved
- validate check is green on the latest commit

## publishing

1. merge the submission PR, then `git checkout main && git pull`
2. `./ci/publish-addon.sh <addon-id>`
3. open the PR for the pushed publish-<id>-<version> branch and merge it
4. `git checkout main && git pull`
5. `./build-deploy.sh` and check `deploy/index.json` lists the new addon
6. `cd deploy && wrangler pages deploy . --project-name=authsrng-addons --commit-dirty=true && cd ..`
7. `curl -s https://addons.authsrng.xyz/index.json` shows the new entry
8. install it from the store page and confirm it runs

deploy only from main, otherwise wrangler makes a preview deployment and the custom domain never sees it.

## pulling an addon

1. delete bundles/<id>/ in a PR and merge
2. rebuild and redeploy as in steps 4 to 7
3. installed players get a removal notice on their next load
