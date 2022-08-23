/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addHelmRepositoryChannelInjectable from "../../../../common/helm/add-helm-repository-channel.injectable";
import addHelmRepositoryInjectable from "./add-helm-repository.injectable";
import { requestChannelListenerInjectionToken } from "../../../../common/utils/channel/request-channel-listener-injection-token";

const addHelmRepositoryChannelListenerInjectable = getInjectable({
  id: "add-helm-repository-channel-listener",

  instantiate: (di) => {
    const addHelmRepository = di.inject(addHelmRepositoryInjectable);
    const channel = di.inject(addHelmRepositoryChannelInjectable);

    return {
      channel,
      handler: addHelmRepository,
    };
  },

  injectionToken: requestChannelListenerInjectionToken,
});

export default addHelmRepositoryChannelListenerInjectable;
