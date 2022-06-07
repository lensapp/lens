/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import getActiveHelmRepositoriesChannelInjectable from "../../../../../common/helm/get-active-helm-repositories-channel.injectable";
import { requestFromChannelInjectionToken } from "../../../../../common/utils/channel/request-from-channel-injection-token";
import showErrorNotificationInjectable from "../../../notifications/show-error-notification.injectable";
import helmRepositoriesErrorStateInjectable from "./helm-repositories-error-state.injectable";
import { runInAction } from "mobx";

const activeHelmRepositoriesInjectable = getInjectable({
  id: "active-helm-repositories",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const getHelmRepositoriesChannel = di.inject(getActiveHelmRepositoriesChannelInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const helmRepositoriesErrorState = di.inject(helmRepositoriesErrorStateInjectable);

    return asyncComputed(async () => {
      const result = await requestFromChannel(getHelmRepositoriesChannel);

      if (result.callWasSuccessful) {
        return result.response;
      } else {
        showErrorNotification(result.error);

        runInAction(() =>
          helmRepositoriesErrorState.set({
            controlsAreShown: false,
            errorMessage: result.error,
          }),
        );

        return [];
      }
    }, []);
  },
});

export default activeHelmRepositoriesInjectable;
