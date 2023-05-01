/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

interface NonWebpackRequire {
  resolve(name: string): string;
}

declare const __non_webpack_require__: NonWebpackRequire;

const pathToNpmCliInjectable = getInjectable({
  id: "path-to-npm-cli",
  instantiate: () => __non_webpack_require__.resolve("npm"),
  causesSideEffects: true,
});

export default pathToNpmCliInjectable;
