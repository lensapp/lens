/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { dumpYaml, KubeConfig } from "@kubernetes/client-node";
import fs from "fs";
import * as lockFile from "proper-lockfile";

export async function saveKubeconfig(config: KubeConfig, path: string) {
  try {
    const release = await lockFile.lock(path);
    const contents = dumpYaml(JSON.parse(config.exportConfig()));

    await fs.promises.writeFile(path, contents);
    await release();
  } catch (e) {
    throw new Error(`Failed to acquire lock file.\n${e}`);
  }
}
