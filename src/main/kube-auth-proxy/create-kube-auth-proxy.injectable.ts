/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { KubeAuthProxy } from "./kube-auth-proxy";
import bundledKubectlPathInjectable from "../kubectl/get-bundled-path.injectable";
import { bind } from "../../common/utils";

const createKubeAuthProxyInjectable = getInjectable({
  instantiate: (di) => bind(KubeAuthProxy.create, null, {
    bundledKubectlPath: di.inject(bundledKubectlPathInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createKubeAuthProxyInjectable;
