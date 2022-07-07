/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export interface ReadFileAsBufferOptions {
  asBuffer: true;
}

export interface ReadFileAsStringOptions {
  asBuffer: false;
}

export interface ReadFileSync {
  (filePath: string, options?: ReadFileAsStringOptions): string;
  (filePath: string, options: ReadFileAsBufferOptions): Buffer;
}

const readFileSyncInjectable = getInjectable({
  id: "read-file-sync",
  instantiate: (di) => {
    const { readFileSync } = di.inject(fsInjectable);

    return ((filePath, options = { asBuffer: false }) => {
      if (options.asBuffer) {
        return readFileSync(filePath);
      } else {
        return readFileSync(filePath, "utf-8");
      }
    }) as ReadFileSync;
  },
});

export default readFileSyncInjectable;
