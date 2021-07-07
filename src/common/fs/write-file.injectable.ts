/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import fsInjectable from "./fs.injectable";

export type WriteFile = (filePath: string, data: string | Buffer) => Promise<void>;

const writeFileInjectable = getInjectable({
  id: "write-file",

  instantiate: (di): WriteFile => {
    const { writeFile, ensureDir } = di.inject(fsInjectable);

    return async (filePath, content) => {
      await ensureDir(path.dirname(filePath), { mode: 0o755 });

      await writeFile(filePath, content, {
        encoding: "utf-8",
      });
    };
  },
});

export default writeFileInjectable;
