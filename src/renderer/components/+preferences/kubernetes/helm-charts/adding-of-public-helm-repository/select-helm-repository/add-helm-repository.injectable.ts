/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addHelmRepositoryChannelInjectable from "../../../../../../../common/helm/add-helm-repository-channel.injectable";
import type { HelmRepo } from "../../../../../../../common/helm/helm-repo";
import { requestFromChannelInjectionToken } from "../../../../../../../common/utils/channel/request-from-channel-injection-token";
import activeHelmRepositoriesInjectable from "../../active-helm-repositories.injectable";
import showErrorNotificationInjectable from "../../../../../notifications/show-error-notification.injectable";
import showSuccessNotificationInjectable from "../../../../../notifications/show-success-notification.injectable";

const addHelmRepositoryInjectable = getInjectable({
  id: "add-public-helm-repository",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const addHelmRepositoryChannel = di.inject(addHelmRepositoryChannelInjectable);
    const activeHelmRepositories = di.inject(activeHelmRepositoriesInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);

    return async (repository: HelmRepo) => {
      const result = await requestFromChannel(
        addHelmRepositoryChannel,
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

export default addHelmRepositoryInjectable;
