/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type AccessPath = (path: string, mode?: number) => Promise<boolean>;

const accessPathInjectable = getInjectable({
  id: "access-path",
  instantiate: (di): AccessPath => {
    const { access } = di.inject(fsInjectable);

    return async (path, mode) => {
      try {
        await access(path, mode);

        return true;
      } catch {
        return false;
      }
    };
  },
});

export default accessPathInjectable;
