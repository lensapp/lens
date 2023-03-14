/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubectlApplyAllChannel, kubectlApplyAllInjectionToken } from "../../common/kube-helpers/channels";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";

const kubectlApplyAllInjectable = getInjectable({
  id: "kubectl-apply-all",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return (req) => requestFromChannel(kubectlApplyAllChannel, req);
  },
  injectionToken: kubectlApplyAllInjectionToken,
});

export default kubectlApplyAllInjectable;
