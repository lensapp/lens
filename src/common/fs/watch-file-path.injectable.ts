/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { watch } from "chokidar";

const watchFilePathInjectable = getInjectable({
  instantiate: () => watch,
  lifecycle: lifecycleEnum.singleton,
});

export default watchFilePathInjectable;
