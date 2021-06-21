#!/bin/bash

while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -f|--force)
      FORCE="--force"
      shift # past argument
      ;;
  esac
done

if [[ `git branch --show-current` =~ ^release/v ]]
then
  VERSION_STRING=$(cat package.json | jq '.version' -r | xargs printf "v%s")
  git tag ${VERSION_STRING} ${FORCE}
  git push ${GIT_REMOTE:-origin} ${VERSION_STRING} ${FORCE}
else
  echo "You must be in a release branch"
fi
