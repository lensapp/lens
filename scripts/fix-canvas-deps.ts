/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import child_process from "child_process";
import fsExtra from "fs-extra";
import fetch from "node-fetch";
import { platform } from "process";
import stream from "stream";
import { promisify } from "util";
import { extract } from "tar";

const { ensureDir, readJson } = fsExtra;

function canvasPrebuiltUrlBuilder(canvasVersion: string, nodeVersion: string) {
  const compiler = platform === "linux"
    ? "glibc"
    : "unknown";

  return `https://github.com/Automattic/node-canvas/releases/download/v${canvasVersion}/canvas-v${canvasVersion}-node-v${nodeVersion}-${platform}-${compiler}-x64.tar.gz`;
}

const exec = promisify(child_process.exec);
const pipeline = promisify(stream.pipeline);

// This is done so that we can skip the scripts for only this package
await exec("npm install canvas@2 --no-save --no-package-lock --ignore-scripts");

const nodeModuleVersion = process.versions.modules;
const canvasVersion = (await readJson("./node_modules/canvas/package.json")).version as string;
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
