/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import child_process from "child_process";
import { ensureDir } from "fs-extra";
import fetch from "node-fetch";
import { platform } from "process";
import { SemVer } from "semver";
import stream from "stream";
import { promisify } from "util";
import { extract } from "tar";

function canvasPrebuiltUrlBuilder(canvasVersion: SemVer, nodeVersion: string) {
  const compiler = platform === "linux"
    ? "glibc"
    : "unknown";

  return `https://github.com/Automattic/node-canvas/releases/download/v${canvasVersion.format()}/canvas-v${canvasVersion.format()}-node-v${nodeVersion}-${platform}-${compiler}-x64.tar.gz`;
}

const exec = promisify(child_process.exec);
const pipeline = promisify(stream.pipeline);

// This is done so that we can skip the scripts for only this package
await exec("npm install canvas@2 --no-save --no-package-lock --ignore-scripts");

const { stdout } = await exec("npm list --depth=0 --json");
const output = JSON.parse(stdout);

const nodeModuleVersion = process.versions.modules;
const canvasVersion = new SemVer(output.dependencies["canvas"].version);
const canvasPrebuildUrl = canvasPrebuiltUrlBuilder(canvasVersion, nodeModuleVersion);

const canvasPrebuilt = await fetch(canvasPrebuildUrl);

if (canvasPrebuilt.status !== 200) {
  throw new Error(`Failed to download prebuilt from ${canvasPrebuildUrl}: ${canvasPrebuilt.statusText}`);
}

await ensureDir("./node_modules/canvas/build");

const dest = extract({
  cwd: "./node_modules/canvas/build",
});

await pipeline(canvasPrebuilt.body, dest);
