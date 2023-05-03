/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getActiveHelmRepositoriesChannel } from "../../../../common/helm/get-active-helm-repositories-channel";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import getActiveHelmRepositoriesInjectable from "./get-active-helm-repositories.injectable";
import { result } from "@k8slens/utilities";

const getActiveHelmRepositoriesChannelListenerInjectable = getRequestChannelListenerInjectable({
  id: "get-active-helm-repositories-channel-listener",
  channel: getActiveHelmRepositoriesChannel,
  getHandler: (di) => {
    const getActiveHelmRepositories = di.inject(getActiveHelmRepositoriesInjectable);

    return async () => {
      const helmResult = await getActiveHelmRepositories();

      if (helmResult.isOk) {
        return helmResult;
      }

      return result.error(helmResult.error.toString());
    };
  },
});

export default getActiveHelmRepositoriesChannelListenerInjectable;
