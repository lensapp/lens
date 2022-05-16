/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const normalizedPlatformInjectable = getInjectable({
  id: "normalized-platform",
  instantiate: () => {
    switch (process.platform) {
      case "darwin":
        return "darwin";
      case "linux":
        return "linux";
      case "win32":
        return "windows";
      default:
        throw new Error(`platform=${process.platform} is unsupported`);
    }
  },
  causesSideEffects: true,
});

export default normalizedPlatformInjectable;
