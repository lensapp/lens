/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import * as fs from "fs";
import * as path from "path";
import packageInfo from "../packages/extensions/package.json";
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

fs.writeFileSync(path.join(__dirname, "../packages/extensions/package.json"), `${JSON.stringify(packageInfo, null, 2)}\n`);
