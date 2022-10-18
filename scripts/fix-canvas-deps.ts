/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import child_process from "child_process";
import { remove } from "fs-extra";
import fetch from "node-fetch";
import { platform } from "process";
import { SemVer } from "semver";
import stream from "stream";
import { promisify } from "util";
import { extract } from "tar";

// From "Node Major Version" to NODE_MODULE_VERSION
const NODE_MODULE_VERSIONS: Partial<Record<string, string>> = {
  "16": "93",
  "17": "102",
  "18": "108",
  "19": "111",
};

function canvasPrebuiltUrlBuilder(canvasVersion: SemVer, nodeVersion: string) {
  const compiler = platform === "linux"
    ? "glibc"
    : "unknown";

  return `https://github.com/Automattic/node-canvas/releases/download/v${canvasVersion.format()}/canvas-v${canvasVersion.format()}-node-v${nodeVersion}-${platform}-${compiler}-x64.tar.gz`;
}

const exec = promisify(child_process.exec);
const pipeline = promisify(stream.pipeline);

const electronVersionCommand = "npm list --depth=0 --json";
const { stdout } = await exec(electronVersionCommand);
const output = JSON.parse(stdout);

const nodeVersion = new SemVer(output.dependencies["@types/node"].version);
const nodeModuleVersion = NODE_MODULE_VERSIONS[`${nodeVersion.major}`];

if (!nodeModuleVersion) {
  throw new Error(`Unknown node major version "${nodeVersion.major}". You need to update the NODE_MODULE_VERSIONS table above from https://nodejs.org/en/download/releases/`);
}

const canvasVersion = new SemVer(output.dependencies["canvas"].version);
const canvasPrebuildUrl = canvasPrebuiltUrlBuilder(canvasVersion, nodeModuleVersion);

await remove("./node_modules/canvas/build/Release");

const canvasPrebuilt = await fetch(canvasPrebuildUrl);

if (canvasPrebuilt.status !== 200) {
  throw new Error(`Failed to download prebuilt from ${canvasPrebuildUrl}: ${canvasPrebuilt.statusText}`);
}

const dest = extract({
  cwd: "./node_modules/canvas/build",
});

await pipeline(canvasPrebuilt.body, dest);
