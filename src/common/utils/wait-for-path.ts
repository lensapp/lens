/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { watch } from "chokidar";
import path from "path";

/**
 * Wait for `filePath` and all parent directories to exist.
 * @param filePath The file path to wait until it exists
 */
export async function waitForPath(filePath: string): Promise<void> {
  console.log("waiting for", filePath);
  const dirOfPath = path.dirname(filePath);

  if (dirOfPath === filePath) {
    // The root of this filesystem, assume it exists
    console.log("found", filePath);

    return;
  } else {
    await waitForPath(dirOfPath);
  }

  return new Promise(resolve => {
    watch(dirOfPath, {
      depth: 0,
    }).on("all", (event, path) => {
      if ((event === "add" || event === "addDir") && path === filePath) {
        console.log("found", filePath);
        resolve();
      }
    });
  });
}
