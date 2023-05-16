#!/bin/bash
set -e

PACKAGE_JSON_PATHS=$(find open-lens/* packages/* -type f -name package.json -not -path "*/node_modules/*")
exitCode=0

while IFS= read -r PACKAGE_JSON_PATH; do
  PACKAGE_NAME=$(<"${PACKAGE_JSON_PATH}" jq .name)

  RAW_PACKAGE_DEPENDENCIES=$(<"${PACKAGE_JSON_PATH}" jq -r '.dependencies // {} | keys | .[]')
  PACKAGE_DEPENDENCIES=$(echo "${RAW_PACKAGE_DEPENDENCIES}" | sort)

  RAW_PACKAGE_DEV_DEPENDENCIES=$(<"${PACKAGE_JSON_PATH}" jq -r '.devDependencies // {} | keys | .[]')
  PACKAGE_DEV_DEPENDENCIES=$(echo "${RAW_PACKAGE_DEV_DEPENDENCIES}" | sort)

  RAW_PACKAGE_PEER_DEPENDENCIES=$(<"${PACKAGE_JSON_PATH}" jq -r '.peerDependencies // {} | keys | .[]')
  PACKAGE_PEER_DEPENDENCIES=$(echo "${RAW_PACKAGE_PEER_DEPENDENCIES}" | sort)

  DUPLICATES_BETWEEN_DEPS_AND_DEV_DEPS=$(comm -12 <(echo "${PACKAGE_DEPENDENCIES}") <(echo "${PACKAGE_DEV_DEPENDENCIES}"))
  DUPLICATES_BETWEEN_DEPS_AND_PEER_DEPS=$(comm -12 <(echo "${PACKAGE_DEPENDENCIES}") <(echo "${PACKAGE_PEER_DEPENDENCIES}"))
  DUPLICATES_BETWEEN_DEV_DEPS_AND_PEER_DEPS=$(comm -12 <(echo "${PACKAGE_DEV_DEPENDENCIES}") <(echo "${PACKAGE_PEER_DEPENDENCIES}"))

  if [[ "${DUPLICATES_BETWEEN_DEPS_AND_DEV_DEPS}" != "" ]]; then
    echo "ERROR: ${PACKAGE_NAME} has duplicate dependencies and devDependencies: ${DUPLICATES_BETWEEN_DEPS_AND_DEV_DEPS}"
    exitCode=1
  fi

  if [[ "${DUPLICATES_BETWEEN_DEPS_AND_PEER_DEPS}" != "" ]]; then
    echo "ERROR: ${PACKAGE_NAME} has duplicate dependencies and peerDependencies: ${DUPLICATES_BETWEEN_DEPS_AND_PEER_DEPS}"
    exitCode=1
  fi

  if [[ "${DUPLICATES_BETWEEN_DEV_DEPS_AND_PEER_DEPS}" != "" ]]; then
    echo "ERROR: ${PACKAGE_NAME} has duplicate devDependencies and peerDependencies: ${DUPLICATES_BETWEEN_DEV_DEPS_AND_PEER_DEPS}"
    exitCode=1
  fi
done <<< "${PACKAGE_JSON_PATHS}"

exit "${exitCode}"
