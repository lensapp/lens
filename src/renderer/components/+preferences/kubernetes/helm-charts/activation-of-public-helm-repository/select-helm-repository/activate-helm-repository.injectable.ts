/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import activateHelmRepositoryChannelInjectable from "../../../../../../../common/helm/activate-helm-repository-channel.injectable";
import type { HelmRepo } from "../../../../../../../common/helm-repo";
import { requestFromChannelInjectionToken } from "../../../../../../../common/utils/channel/request-from-channel-injection-token";
import activeHelmRepositoriesInjectable from "../../active-helm-repositories.injectable";
import showErrorNotificationInjectable from "../../../../../notifications/show-error-notification.injectable";
import showSuccessNotificationInjectable from "../../../../../notifications/show-success-notification.injectable";

const activateHelmRepositoryInjectable = getInjectable({
  id: "activate-public-helm-repository",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const activateHelmRepositoryChannel = di.inject(activateHelmRepositoryChannelInjectable);
    const activeHelmRepositories = di.inject(activeHelmRepositoriesInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);

    return async (repository: HelmRepo) => {
      const result = await requestFromChannel(
        activateHelmRepositoryChannel,
        repository,
      );

      if (result.callWasSuccessful) {
        showSuccessNotification(
          `Helm repository ${repository.name} has been added.`,
        );

        activeHelmRepositories.invalidate();
      } else {
        showErrorNotification(result.error);
      }
    };
  },
});

export default activateHelmRepositoryInjectable;
