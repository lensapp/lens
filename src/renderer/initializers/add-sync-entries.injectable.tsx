/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getAllEntries } from "../components/+preferences/kubeconfig-syncs";
import { Notifications } from "../components/notifications";
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import React from "react";
import navigateToKubernetesPreferencesInjectable from "../../common/front-end-routing/routes/preferences/kubernetes/navigate-to-kubernetes-preferences.injectable";
import loggerInjectable from "../../common/logger.injectable";

const addSyncEntriesInjectable = getInjectable({
  id: "add-sync-entries",

  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);
    const navigateToKubernetesPreferences = di.inject(navigateToKubernetesPreferencesInjectable);
    const logger = di.inject(loggerInjectable);

    return async (filePaths: string[]) => {
      userStore.syncKubeconfigEntries.merge(
        await getAllEntries(filePaths, logger),
      );

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

