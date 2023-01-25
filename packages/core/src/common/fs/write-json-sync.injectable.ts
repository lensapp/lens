/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getDirnameOfPathInjectable from "../path/get-dirname.injectable";
import fsInjectable from "./fs.injectable";

export type WriteJsonSync = (filePath: string, contents: unknown) => void;

const writeJsonSyncInjectable = getInjectable({
  id: "write-json-sync",
  instantiate: (di): WriteJsonSync => {
    const {
      writeJsonSync,
      ensureDirSync,
    } = di.inject(fsInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);

    return (filePath, content) => {
      ensureDirSync(getDirnameOfPath(filePath), { mode: 0o755 });

      writeJsonSync(filePath, content, {
        encoding: "utf-8",
        spaces: 2,
      });
    };
  },
});

export default writeJsonSyncInjectable;
