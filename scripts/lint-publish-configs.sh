#!/bin/bash
set -e

PACKAGE_JSON_PATHS=$(find open-lens/* packages/* -type f -name package.json -not -path "*/node_modules/*")
exitCode=0

while IFS= read -r PACKAGE_JSON_PATH; do
  PACKAGE_NAME=$(<"${PACKAGE_JSON_PATH}" jq .name)
  PACKAGE_IS_PRIVATE=$(<"${PACKAGE_JSON_PATH}" jq .private)

  if [[ "${PACKAGE_IS_PRIVATE}" == "true" ]]; then
    continue
  fi

  PACKAGE_HAS_PUBLISH_CONFIG=$(<"${PACKAGE_JSON_PATH}" jq '.publishConfig != null')

  if [[ "${PACKAGE_HAS_PUBLISH_CONFIG}" == "false" ]]; then
    echo "${PACKAGE_NAME} is missing publish config"
    exitCode=1
  fi
done <<< "${PACKAGE_JSON_PATHS}"

exit "${exitCode}"
