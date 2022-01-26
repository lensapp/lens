/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

const readFileInjectable = getInjectable({
  instantiate: (di) => di.inject(fsInjectable).readFile,
  lifecycle: lifecycleEnum.singleton,
});

export default readFileInjectable;
