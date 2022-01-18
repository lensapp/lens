/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import * as fse from "fs-extra";
import * as path from "path";
import appInfo from "../package.json";
import semver from "semver";
import fastGlob from "fast-glob";

const packagePath = path.join(__dirname, "../package.json");
const versionInfo = semver.parse(appInfo.version);
const buildNumber = process.env.BUILD_NUMBER || Date.now().toString();

function getBuildChannel(): string {
  const preRelease = versionInfo.prerelease?.[0];

  switch (preRelease) {
    case "alpha":
    case "beta":
    case "rc":
      return preRelease;
    case undefined:
    case "latest":
      return "latest"; // needed because electron-updater does not take build information into account when resolving if update is available
    default:
      throw new Error(`invalid pre-release ${preRelease}`);
  }
}

async function writeOutExtensionVersion(manifestPath: string) {
  const extensionPackageJson = await fse.readJson(manifestPath);

  extensionPackageJson.version = appInfo.version;

  return fse.writeJson(manifestPath, extensionPackageJson, {
    spaces: 2,
  });
}

async function writeOutNewVersions() {
  await Promise.all([
    fse.writeJson(packagePath, appInfo, {
      spaces: 2,
    }),
    ...(await fastGlob(["extensions/*/package.json"])).map(writeOutExtensionVersion),
  ]);
}

function main() {
  const prereleaseParts: string[] = [getBuildChannel()];

  if (versionInfo.prerelease && versionInfo.prerelease.length > 1) {
    prereleaseParts.push(versionInfo.prerelease[1].toString());
  }

  prereleaseParts.push(buildNumber);

  appInfo.version = `${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}-${prereleaseParts.join(".")}`;

  writeOutNewVersions()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

main();
