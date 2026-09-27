#!/bin/bash
set -e
rm -rf deploy
mkdir -p deploy/run deploy/bundles
cp addons-runtime/run/index.html deploy/run/
cp addons-runtime/_redirects deploy/_redirects
mkdir -p "deploy/functions/run"
cp "addons-runtime/functions/run/[[path]].js" "deploy/functions/run/[[path]].js"
if [ -d bundles ] && [ "$(ls -A bundles 2>/dev/null)" ]; then
  cp -r bundles/* deploy/bundles/
fi
node ci/build-index.js deploy/index.json