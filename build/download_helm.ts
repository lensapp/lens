/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import packageInfo from "../package.json";
import { isWindows } from "../src/common/vars";
import { HelmCli } from "../src/main/helm/helm-cli";
import * as path from "path";

const helmVersion = packageInfo.config.bundledHelmVersion;

if (!isWindows) {
  Promise.all([
    new HelmCli(path.join(process.cwd(), "binaries", "client", "x64"), helmVersion).ensureBinary(),
    new HelmCli(path.join(process.cwd(), "binaries", "client", "arm64"), helmVersion).ensureBinary(),
  ]);
} else {
  new HelmCli(path.join(process.cwd(), "binaries", "client", "x64"), helmVersion).ensureBinary();
}
