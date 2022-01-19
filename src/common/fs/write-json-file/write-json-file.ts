/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import path from "path";
import type { JsonObject } from "type-fest";

interface Dependencies {
  fs: {
    ensureDir: (
      directoryName: string,
      options: { mode: number }
    ) => Promise<void>;

    writeJson: (
      filePath: string,
      contentObject: JsonObject,
      options: { spaces: number }
    ) => Promise<void>;
  };
}

export const writeJsonFile =
  ({ fs }: Dependencies) =>
    async (filePath: string, contentObject: JsonObject) => {
      const directoryName = path.dirname(filePath);

      await fs.ensureDir(directoryName, { mode: 0o755 });

      await fs.writeJson(filePath, contentObject, { spaces: 2 });
    };
