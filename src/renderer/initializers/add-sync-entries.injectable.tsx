/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Notifications } from "../components/notifications";
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import React from "react";
import navigateToKubernetesPreferencesInjectable from "../../common/front-end-routing/routes/preferences/kubernetes/navigate-to-kubernetes-preferences.injectable";
import getAllSyncEntriesInjectable from "../components/+preferences/kubeconfig-syncs/get-all-entries.injectable";

const addSyncEntriesInjectable = getInjectable({
  id: "add-sync-entries",

  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);
    const navigateToKubernetesPreferences = di.inject(navigateToKubernetesPreferencesInjectable);
    const getAllSyncEntries = di.inject(getAllSyncEntriesInjectable);

    return async (filePaths: string[]) => {
      userStore.syncKubeconfigEntries.merge(await getAllSyncEntries(filePaths));

      Notifications.ok(
        <div>
          <p>Selected items has been added to Kubeconfig Sync.</p><br/>
          <p>Check the <a style={{ textDecoration: "underline" }} onClick={navigateToKubernetesPreferences}>Preferences</a>{" "}
          to see full list.</p>
        </div>,
      );
    };
  },
});

export default addSyncEntriesInjectable;

