/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type ReadFileBufferSync = (filePath: string) => Buffer;

const readFileBufferSyncInjectable = getInjectable({
  id: "read-file-buffer-sync",
  instantiate: (di): ReadFileBufferSync => {
    const { readFileSync } = di.inject(fsInjectable);

    return (filePath) => readFileSync(filePath);
  },
});

export default readFileBufferSyncInjectable;
