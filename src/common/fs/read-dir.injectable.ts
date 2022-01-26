/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

const readDirInjectable = getInjectable({
  instantiate: (di) => di.inject(fsInjectable).readdir,
  lifecycle: lifecycleEnum.singleton,
});

export default readDirInjectable;
