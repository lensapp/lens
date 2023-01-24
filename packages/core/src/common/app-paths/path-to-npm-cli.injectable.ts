/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const pathToNpmCliInjectable = getInjectable({
  id: "path-to-npm-cli",
  instantiate: () => __non_webpack_require__.resolve("npm"),
  causesSideEffects: true,
});

export default pathToNpmCliInjectable;
