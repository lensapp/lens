/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../../../../common/helm/helm-repo";
import { requestFromChannelInjectionToken } from "../../../../../common/utils/channel/request-from-channel-injection-token";
import activeHelmRepositoriesInjectable from "./active-helm-repositories.injectable";
import removeHelmRepositoryChannelInjectable from "../../../../../common/helm/remove-helm-repository-channel.injectable";

const removePublicHelmRepositoryInjectable = getInjectable({
  id: "remove-public-helm-repository",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const removeHelmRepositoryChannel = di.inject(removeHelmRepositoryChannelInjectable);
    const activeHelmRepositories = di.inject(activeHelmRepositoriesInjectable);

    return async (repository: HelmRepo) => {
      await requestFromChannel(removeHelmRepositoryChannel, repository);

      activeHelmRepositories.invalidate();
    };
  },
});

export default removePublicHelmRepositoryInjectable;
