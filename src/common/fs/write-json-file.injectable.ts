/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getDirnameOfPathInjectable from "../path/get-dirname.injectable";
import fsInjectable from "./fs.injectable";

export type WriteJson = (filePath: string, contents: unknown) => Promise<void>;

const writeJsonFileInjectable = getInjectable({
  id: "write-json-file",

  instantiate: (di): WriteJson => {
    const { writeJson, ensureDir } = di.inject(fsInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);

    return async (filePath, content) => {
      await ensureDir(getDirnameOfPath(filePath), { mode: 0o755 });

      await writeJson(filePath, content, {
        encoding: "utf-8",
        spaces: 2,
      });
    };
  },
});

export default writeJsonFileInjectable;
