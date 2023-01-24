/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubectlDeleteAllChannel, kubectlDeleteAllInjectionToken } from "../../common/kube-helpers/channels";
import requestFromChannelInjectable from "../utils/channel/request-from-channel.injectable";

const kubectlDeleteAllInjectable = getInjectable({
  id: "kubectl-delete-all",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return (req) => requestFromChannel(kubectlDeleteAllChannel, req);
  },
  injectionToken: kubectlDeleteAllInjectionToken,
});

export default kubectlDeleteAllInjectable;
