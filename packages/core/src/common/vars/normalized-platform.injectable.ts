/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import platformInjectable from "./platform.injectable";

export type NormalizedPlatform = "darwin" | "linux" | "windows";

const normalizedPlatformInjectable = getInjectable({
  id: "normalized-platform",

  instantiate: (di): NormalizedPlatform => {
    const platform = di.inject(platformInjectable);

    switch (platform) {
      case "darwin":
        return "darwin";
      case "linux":
        return "linux";
      case "win32":
        return "windows";
      default:
        throw new Error(`platform=${platform} is unsupported`);
    }
  },
});

export default normalizedPlatformInjectable;
