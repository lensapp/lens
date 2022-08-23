/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PortForwardArgs } from "./port-forward";
import { PortForward } from "./port-forward";
import bundledKubectlInjectable from "../../../kubectl/bundled-kubectl.injectable";

const createPortForwardInjectable = getInjectable({
  id: "create-port-forward",

  instantiate: (di) => {
    const bundledKubectl = di.inject(bundledKubectlInjectable);

    const dependencies = {
      getKubectlBinPath: bundledKubectl.getPath,
    };

    return (pathToKubeConfig: string, args: PortForwardArgs) =>
      new PortForward(dependencies, pathToKubeConfig, args);
  },
});

export default createPortForwardInjectable;
