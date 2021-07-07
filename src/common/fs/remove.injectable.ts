/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type RemoveDir = (path: string) => Promise<void>;

const removeDirInjectable = getInjectable({
  instantiate: (di): RemoveDir => di.inject(fsInjectable).remove,
  id: "remove-dir",
});

export default removeDirInjectable;
