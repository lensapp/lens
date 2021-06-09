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
import packageInfo from "../src/extensions/npm/extensions/package.json";
import appInfo from "../package.json";
import { SemVer } from "semver";
import { execSync } from "child_process";

const { NPM_RELEASE_TAG = "latest" } = process.env;
const version = new SemVer(appInfo.version);

if (NPM_RELEASE_TAG !== "latest") {
  const gitRef = execSync("git rev-parse --short HEAD", {
    encoding: "utf-8",
  });

  version.inc("prerelease", `git.${gitRef.trim()}`);
}

packageInfo.version = version.format();

fs.writeFileSync(path.join(__dirname, "../src/extensions/npm/extensions/package.json"), `${JSON.stringify(packageInfo, null, 2)}\n`);
