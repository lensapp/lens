/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { readFileNotify } from "../read-file-notify/read-file-notify";
import path from "path";
import type { InstallRequest } from "../attempt-install/install-request";

interface Dependencies {
  attemptInstall: (request: InstallRequest) => Promise<void>;
}

export const attemptInstalls =
  ({ attemptInstall }: Dependencies) =>
    async (filePaths: string[]): Promise<void> => {
      const promises: Promise<void>[] = [];

      for (const filePath of filePaths) {
        promises.push(
          attemptInstall({
            fileName: path.basename(filePath),
            dataP: readFileNotify(filePath),
          }),
        );
      }

      await Promise.allSettled(promises);
    };
