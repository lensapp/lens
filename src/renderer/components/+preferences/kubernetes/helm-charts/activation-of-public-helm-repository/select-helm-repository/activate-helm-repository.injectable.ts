/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import activateHelmRepositoryChannelInjectable from "../../../../../../../common/helm/activate-helm-repository-channel.injectable";
import type { HelmRepo } from "../../../../../../../common/helm-repo";
import { requestFromChannelInjectionToken } from "../../../../../../../common/utils/channel/request-from-channel-injection-token";
import activeHelmRepositoriesInjectable from "../../active-helm-repositories.injectable";

const activateHelmRepositoryInjectable = getInjectable({
  id: "activate-public-helm-repository",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const activateHelmRepositoryChannel = di.inject(activateHelmRepositoryChannelInjectable);
    const activeHelmRepositories = di.inject(activeHelmRepositoriesInjectable);

    return async (repository: HelmRepo) => {
      await requestFromChannel(activateHelmRepositoryChannel, repository);

      activeHelmRepositories.invalidate();
    };
  },
});

export default activateHelmRepositoryInjectable;
