/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";

const kubectlBinaryNameInjectable = getInjectable({
  id: "kubectl-binary-name",
  instantiate: (di) => {
    const platform = di.inject(normalizedPlatformInjectable);

    return platform === "windows"
      ? "kubectl.exe"
      : "kubectl";
  },
});

export default kubectlBinaryNameInjectable;
