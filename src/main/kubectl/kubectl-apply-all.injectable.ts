/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubectlApplyAllInjectionToken } from "../../common/kube-helpers/channels";
import kubectlApplyAllChannelHandlerInjectable from "./apply-all-handler.injectable";

const kubectlApplyAllInjectable = getInjectable({
  id: "kubectl-apply-all",
  instantiate: (di) => {
    const channelHandler = di.inject(kubectlApplyAllChannelHandlerInjectable);

    return async (req) => channelHandler.handler(req);
  },
  injectionToken: kubectlApplyAllInjectionToken,
});

export default kubectlApplyAllInjectable;
