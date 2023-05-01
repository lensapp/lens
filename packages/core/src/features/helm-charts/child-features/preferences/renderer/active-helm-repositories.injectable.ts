/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { getActiveHelmRepositoriesChannel } from "../../../../../common/helm/get-active-helm-repositories-channel";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import showErrorNotificationInjectable from "../../../../../renderer/components/notifications/show-error-notification.injectable";
import helmRepositoriesErrorStateInjectable from "./helm-repositories-error-state.injectable";
import { runInAction } from "mobx";

const activeHelmRepositoriesInjectable = getInjectable({
  id: "active-helm-repositories",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const helmRepositoriesErrorState = di.inject(
      helmRepositoriesErrorStateInjectable,
    );

    return asyncComputed({
      getValueFromObservedPromise: async () => {
        const result = await requestFromChannel(
          getActiveHelmRepositoriesChannel,
        );

        if (result.isOk) {
          return result.value;
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
      },

      valueWhenPending: [],
    });
  },
});

export default activeHelmRepositoriesInjectable;
