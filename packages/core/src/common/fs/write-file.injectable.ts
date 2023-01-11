/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { WriteFileOptions } from "fs-extra";
import getDirnameOfPathInjectable from "../path/get-dirname.injectable";
import fsInjectable from "./fs.injectable";

export type WriteFile = (filePath: string, content: string | Buffer, opts?: WriteFileOptions) => Promise<void>;

const writeFileInjectable = getInjectable({
  id: "write-file",

  instantiate: (di): WriteFile => {
    const { writeFile, ensureDir } = di.inject(fsInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);

    return async (filePath, content, opts = {}) => {
      await ensureDir(getDirnameOfPath(filePath), {
        mode: 0o755,
        ...opts,
      });

      const { encoding = "utf-8", ...options } = opts;

      await writeFile(filePath, content, {
        encoding: encoding as BufferEncoding,
        ...options,
      });
    };
  },
});

export default writeFileInjectable;
