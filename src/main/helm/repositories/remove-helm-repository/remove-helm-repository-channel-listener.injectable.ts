/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestChannelListenerInjectionToken } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import removeHelmRepositoryInjectable from "./remove-helm-repository.injectable";
import removeHelmRepositoryChannelInjectable from "../../../../common/helm/remove-helm-repository-channel.injectable";

const removeHelmRepositoryChannelListenerInjectable = getInjectable({
  id: "remove-helm-repository-channel-listener",

  instantiate: (di) => {
    const removeHelmRepository = di.inject(removeHelmRepositoryInjectable);
    const channel = di.inject(removeHelmRepositoryChannelInjectable);

    return {
      channel,
      handler: removeHelmRepository,
    };
  },

  injectionToken: requestChannelListenerInjectionToken,
});

export default removeHelmRepositoryChannelListenerInjectable;
