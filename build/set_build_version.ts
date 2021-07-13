/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
  switch (versionInfo.prerelease?.[0]) {
    case "beta":
      return "beta";
    case undefined:
      return "latest";
    default:
      return "alpha";
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
