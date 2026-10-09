#!/bin/bash
set -e
id="$1"
if [ -z "$id" ]; then
  echo "usage: ./ci/publish-addon.sh <addon-id>"
  exit 1
fi
src="submissions/$id"
if [ ! -d "$src" ]; then
  echo "no such submission: $src"
  exit 1
fi
ver=$(node -p "require('./$src/manifest.json').version")
entry=$(node -p "require('./$src/manifest.json').entry")
dest="bundles/$id/$ver"
if [ -e "$dest" ]; then
  echo "already published: $dest"
  exit 1
fi
git checkout main
git pull
mkdir -p "$dest"
cp "$src/manifest.json" "$dest/"
cp "$src/$entry" "$dest/"
git checkout -b "publish-$id-$ver"
git add "bundles/$id"
git commit -m "publish $id $ver"
git push -u origin "publish-$id-$ver"
