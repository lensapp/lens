/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreFileNameMigrationInjectable from "../../common/user-store/file-name-migration.injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import initDefaultUpdateChannelInjectable from "../vars/default-update-channel/init.injectable";

const initUserStoreInjectable = getInjectable({
  id: "init-user-store",
  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);
    const userStoreFileNameMigration = di.inject(userStoreFileNameMigrationInjectable);

    return {
      id: "init-user-store",
      run: async () => {
        await userStoreFileNameMigration();
        userStore.load();
      },
      runAfter: di.inject(initDefaultUpdateChannelInjectable),
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initUserStoreInjectable;
