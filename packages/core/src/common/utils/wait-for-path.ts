/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { FSWatcher } from "chokidar";
import path from "path";

/**
 * Wait for `filePath` and all parent directories to exist.
 * @param pathname The file path to wait until it exists
 *
 * NOTE: There is technically a race condition in this function of the form
 * "time-of-check to time-of-use" because we have to wait for each parent
 * directory to exist first.
 */
export async function waitForPath(pathname: string): Promise<void> {
  const dirOfPath = path.dirname(pathname);

  if (dirOfPath === pathname) {
    // The root of this filesystem, assume it exists
    return;
  } else {
    await waitForPath(dirOfPath);
  }

  return new Promise((resolve, reject) => {
    const watcher = new FSWatcher({
      depth: 0,
      disableGlobbing: true,
    });
    const onAddOrAddDir = (filePath: string) => {
      if (filePath === pathname) {
        watcher.unwatch(dirOfPath);
        watcher
          .close()
          .then(() => resolve())
          .catch(reject);
      }
    };
    const onError = (error: any) => {
      watcher.unwatch(dirOfPath);
      watcher
        .close()
        .then(() => reject(error))
        .catch(() => reject(error));
    };

    watcher
      .on("add", onAddOrAddDir)
      .on("addDir", onAddOrAddDir)
      .on("error", onError)
      .add(dirOfPath);
  });
}
