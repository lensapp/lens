/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import processArchInjectable from "./process-arch.injectable";

const normalizedPlatformArchitectureInjectable = getInjectable({
  id: "normalized-platform-architecture",
  instantiate: (di) => {
    const platformArch = di.inject(processArchInjectable);

    switch (platformArch) {
      case "arm64":
        return "arm64";
      case "x64":
      case "amd64":
        return "x64";
      case "386":
      case "x32":
      case "ia32":
        return "ia32";
      default:
        throw new Error(`arch=${platformArch} is unsupported`);
    }
  },
});

export default normalizedPlatformArchitectureInjectable;
