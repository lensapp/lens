/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../../../../common/helm-repo";
import { requestFromChannelInjectionToken } from "../../../../../common/utils/channel/request-from-channel-injection-token";
import activeHelmRepositoriesInjectable from "./active-helm-repositories.injectable";
import deactivateHelmRepositoryChannelInjectable from "../../../../../common/helm/deactivate-helm-repository-channel.injectable";

const activatePublicHelmRepositoryInjectable = getInjectable({
  id: "deactivate-public-helm-repository",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const deactivateHelmRepositoryChannel = di.inject(deactivateHelmRepositoryChannelInjectable);
    const activeHelmRepositories = di.inject(activeHelmRepositoriesInjectable);

    return async (repository: HelmRepo) => {
      await requestFromChannel(deactivateHelmRepositoryChannel, repository);

      activeHelmRepositories.invalidate();
    };
  },
});

export default activatePublicHelmRepositoryInjectable;
