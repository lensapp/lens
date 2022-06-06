/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import activateHelmRepositoryChannelInjectable from "../../../../common/helm/activate-helm-repository-channel.injectable";
import activateHelmRepositoryInjectable from "./activate-helm-repository.injectable";
import { requestChannelListenerInjectionToken } from "../../../../common/utils/channel/request-channel-listener-injection-token";

const activateHelmRepositoryChannelListenerInjectable = getInjectable({
  id: "activate-helm-repository-channel-listener",

  instantiate: (di) => {
    const activateHelmRepository = di.inject(activateHelmRepositoryInjectable);
    const channel = di.inject(activateHelmRepositoryChannelInjectable);

    return {
      channel,
      handler: activateHelmRepository,
    };
  },

  injectionToken: requestChannelListenerInjectionToken,
});

export default activateHelmRepositoryChannelListenerInjectable;
