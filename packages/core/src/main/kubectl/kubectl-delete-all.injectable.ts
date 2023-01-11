/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubectlDeleteAllInjectionToken } from "../../common/kube-helpers/channels";
import kubectlDeleteAllChannelHandlerInjectable from "./delete-all-handler.injectable";

const kubectlDeleteAllInjectable = getInjectable({
  id: "kubectl-delete-all",
  instantiate: (di) => {
    const channel = di.inject(kubectlDeleteAllChannelHandlerInjectable);

    return async (req) => channel.handler(req);
  },
  injectionToken: kubectlDeleteAllInjectionToken,
});

export default kubectlDeleteAllInjectable;
