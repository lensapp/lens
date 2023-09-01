/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PortForwardArgs, PortForwardDependencies } from "./port-forward";
import { PortForward } from "./port-forward";
import bundledKubectlInjectable from "../../../kubectl/bundled-kubectl.injectable";
import getPortFromStreamInjectable from "../../../utils/get-port-from-stream.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

export type CreatePortForward = (pathToKubeConfig: string, kubeContext:string, args: PortForwardArgs) => PortForward;

const createPortForwardInjectable = getInjectable({
  id: "create-port-forward",

  instantiate: (di): CreatePortForward => {
    const dependencies: PortForwardDependencies = {
      getKubectlBinPath: di.inject(bundledKubectlInjectable).getPath,
      getPortFromStream: di.inject(getPortFromStreamInjectable),
      logger: di.inject(loggerInjectionToken),
    };

    return (pathToKubeConfig, kubeContext, args) => new PortForward(dependencies, pathToKubeConfig, kubeContext, args);
  },
});

export default createPortForwardInjectable;
