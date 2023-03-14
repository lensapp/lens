/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../../../../common/helm/helm-repo";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import activeHelmRepositoriesInjectable from "./active-helm-repositories.injectable";
import { removeHelmRepositoryChannel } from "../../../../../common/helm/remove-helm-repository-channel";

const removePublicHelmRepositoryInjectable = getInjectable({
  id: "remove-public-helm-repository",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const activeHelmRepositories = di.inject(activeHelmRepositoriesInjectable);

    return async (repository: HelmRepo) => {
      await requestFromChannel(removeHelmRepositoryChannel, repository);

      activeHelmRepositories.invalidate();
    };
  },
});

export default removePublicHelmRepositoryInjectable;
