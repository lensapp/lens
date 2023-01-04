/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getDirnameOfPathInjectable from "../path/get-dirname.injectable";
import fsInjectable from "./fs.injectable";

export type WriteBufferSync = (filePath: string, contents: Buffer) => void;

const writeBufferSyncInjectable = getInjectable({
  id: "write-buffer-sync",
  instantiate: (di): WriteBufferSync => {
    const {
      writeFileSync,
      ensureDirSync,
    } = di.inject(fsInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);

    return (filePath, contents) => {
      ensureDirSync(getDirnameOfPath(filePath), {
        mode: 0o755,
      });
      writeFileSync(filePath, contents);
    };
  },
});

export default writeBufferSyncInjectable;
