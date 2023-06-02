/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import navigateToKubernetesPreferencesInjectable from "../../features/preferences/common/navigate-to-kubernetes-preferences.injectable";
import { runInAction } from "mobx";
import { showSuccessNotificationInjectable } from "@k8slens/notifications";
import userPreferencesStateInjectable from "../../features/user-preferences/common/state.injectable";

const addSyncEntriesInjectable = getInjectable({
  id: "add-sync-entries",

  instantiate: (di) => {
    const state = di.inject(userPreferencesStateInjectable);
    const navigateToKubernetesPreferences = di.inject(navigateToKubernetesPreferencesInjectable);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);

    return async (paths: string[]) => {
      runInAction(() => {
        for (const path of paths) {
          state.syncKubeconfigEntries.set(path, {});
        }
      });

      showSuccessNotification((
        <div>
          <p>Selected items has been added to Kubeconfig Sync.</p>
          <br/>
          <p>
            {"Check the "}
            <a style={{ textDecoration: "underline" }} onClick={navigateToKubernetesPreferences}>Preferences</a>
            {" to see full list."}
          </p>
        </div>
      ));
    };
  },
});

export default addSyncEntriesInjectable;

