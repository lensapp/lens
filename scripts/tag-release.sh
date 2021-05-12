#!/bin/bash

if [[ ${git branch --show-current} =~ ^release/v ]]
then
  VERSION_STRING=$(cat package.json | jq '.version' -r | xargs printf "v%s")
  git tag ${VERSION_STRING}
  git push ${GIT_REMOTE:-origin} ${VERSION_STRING}
else
  echo "You must be in a release branch"
fi
