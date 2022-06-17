/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestChannelListenerInjectionToken } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import getActiveHelmRepositoriesChannelInjectable from "../../../../common/helm/get-active-helm-repositories-channel.injectable";
import getActiveHelmRepositoriesInjectable from "./get-active-helm-repositories.injectable";

const getActiveHelmRepositoriesChannelListenerInjectable = getInjectable({
  id: "get-active-helm-repositories-channel-listener",

  instantiate: (di) => {
    const getActiveHelmRepositories = di.inject(getActiveHelmRepositoriesInjectable);

    return {
      channel: di.inject(getActiveHelmRepositoriesChannelInjectable),

      handler: getActiveHelmRepositories,
    };
  },

  injectionToken: requestChannelListenerInjectionToken,
});

export default getActiveHelmRepositoriesChannelListenerInjectable;
