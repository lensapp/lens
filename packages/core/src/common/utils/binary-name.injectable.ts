/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import normalizedPlatformInjectable from "../vars/normalized-platform.injectable";

const binaryNameInjectable = getInjectable({
  id: "binary-name",
  instantiate: (di, binaryName) => {
    const normalizedPlatform = di.inject(normalizedPlatformInjectable);

    if (normalizedPlatform === "windows") {
      return `${binaryName}.exe`;
    }

    return binaryName;
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, binaryName: string) => binaryName,
  }),
});

export default binaryNameInjectable;
