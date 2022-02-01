/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type RemoveDir = (dir: string) => Promise<void>;

const removeDirInjectable = getInjectable({
  instantiate: (di) => di.inject(fsInjectable).remove as RemoveDir,
  lifecycle: lifecycleEnum.singleton,
});

export default removeDirInjectable;
