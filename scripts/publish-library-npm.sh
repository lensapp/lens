#!/bin/bash

./node_modules/.bin/npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}"

NPM_RELEASE_TAG=$(cat package.json | jq .version --raw-output | rg '.*-(?P<channel>\w+).*' -r '$channel' | cat)

npm publish --access=public --tag=${NPM_RELEASE_TAG:-latest}
