/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Notifications } from "../components/notifications";
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import React from "react";
import navigateToKubernetesPreferencesInjectable from "../../features/preferences/common/navigate-to-kubernetes-preferences.injectable";
import discoverAllKubeconfigSyncKindsInjectable from "../../features/preferences/renderer/preference-items/kubernetes/kubeconfig-sync/discover-all-sync-kinds.injectable";
import { action } from "mobx";

const addSyncEntriesInjectable = getInjectable({
  id: "add-sync-entries",

  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);
    const navigateToKubernetesPreferences = di.inject(navigateToKubernetesPreferencesInjectable);
    const discoverAllKubeconfigSyncKinds = di.inject(discoverAllKubeconfigSyncKindsInjectable);

    return async (filePaths: string[]) => {
      const kinds = await discoverAllKubeconfigSyncKinds(filePaths);

      action(() => {
        for (const [path] of kinds) {
          userStore.syncKubeconfigEntries.set(path, {});
        }
      });

      Notifications.ok((
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

