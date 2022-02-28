/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { contextDir } from "../vars";

const contextDirInjectable = getInjectable({
  id: "context-dir",
  instantiate: () => contextDir,
  lifecycle: lifecycleEnum.singleton,
});

export default contextDirInjectable;
