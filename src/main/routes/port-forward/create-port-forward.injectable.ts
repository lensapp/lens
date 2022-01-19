/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { PortForward, PortForwardArgs } from "./port-forward";
import bundledKubectlInjectable from "../../kubectl/bundled-kubectl.injectable";

const createPortForwardInjectable = getInjectable({
  instantiate: (di) => {
    const bundledKubectl = di.inject(bundledKubectlInjectable);

    const dependencies = {
      getKubectlBinPath: bundledKubectl.getPath,
    };

    return (pathToKubeConfig: string, args: PortForwardArgs) =>
      new PortForward(dependencies, pathToKubeConfig, args);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default createPortForwardInjectable;
