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
import * as fs from "fs";
import * as path from "path";
import appInfo from "../package.json";
import semver from "semver";
import fastGlob from "fast-glob";

const packagePath = path.join(__dirname, "../package.json");
const versionInfo = semver.parse(appInfo.version);
const buildNumber = process.env.BUILD_NUMBER || "1";
let buildChannel = "alpha";

if (versionInfo.prerelease) {
  if (versionInfo.prerelease.includes("alpha")) {
    buildChannel = "alpha";
  } else {
    buildChannel = "beta";
  }
  appInfo.version = `${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}-${buildChannel}.${versionInfo.prerelease[1]}.${buildNumber}`;
} else {
  appInfo.version = `${appInfo.version}-latest.${buildNumber}`;
}


fs.writeFileSync(packagePath, `${JSON.stringify(appInfo, null, 2)}\n`);

const extensionManifests = fastGlob.sync(["extensions/*/package.json"]);

for (const manifestPath of extensionManifests) {
  const packagePath = path.join(__dirname, "..", manifestPath);

  import(packagePath).then((packageInfo) => {
    packageInfo.default.version = `${versionInfo.raw}.${Date.now()}`;
    fs.writeFileSync(packagePath, `${JSON.stringify(packageInfo.default, null, 2)}\n`);
  });
}
