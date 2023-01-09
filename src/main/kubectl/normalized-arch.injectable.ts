/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import processArchInjectable from "../../common/vars/process-arch.injectable";

const kubectlDownloadingNormalizedArchInjectable = getInjectable({
  id: "kubectl-downloading-normalized-arch",
  instantiate: (di) => {
    const processArch = di.inject(processArchInjectable);

    switch (processArch) {
      case "arm64":
        return "arm64";
      case "x64":
      case "amd64":
        return "amd64";
      case "386":
      case "x32":
      case "ia32":
        return "386";
      default:
        throw new Error(`arch=${processArch} is unsupported`);
    }
  },
});

export default kubectlDownloadingNormalizedArchInjectable;
