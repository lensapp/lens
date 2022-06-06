/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestChannelListenerInjectionToken } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import deactivateHelmRepositoryInjectable from "./deactivate-helm-repository.injectable";
import deactivateHelmRepositoryChannelInjectable from "../../../../common/helm/deactivate-helm-repository-channel.injectable";

const deactivateHelmRepositoryChannelListenerInjectable = getInjectable({
  id: "deactivate-helm-repository-channel-listener",

  instantiate: (di) => {
    const deactivateHelmRepository = di.inject(deactivateHelmRepositoryInjectable);
    const channel = di.inject(deactivateHelmRepositoryChannelInjectable);

    return {
      channel,
      handler: deactivateHelmRepository,
    };
  },

  injectionToken: requestChannelListenerInjectionToken,
});

export default deactivateHelmRepositoryChannelListenerInjectable;
