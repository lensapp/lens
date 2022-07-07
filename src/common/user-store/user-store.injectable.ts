/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { UserStore } from "./user-store";
import selectedUpdateChannelInjectable from "../application-update/selected-update-channel/selected-update-channel.injectable";
import { userStoreMigrationsInjectionToken, userStorePreMigrationsInjectionToken } from "./migrations";

const userStoreInjectable = getInjectable({
  id: "user-store",

  instantiate: (di) => {
    const preMigrations = di.injectMany(userStorePreMigrationsInjectionToken);

    UserStore.resetInstance();

    for (const preMigration of preMigrations) {
      preMigration();
    }

    return UserStore.createInstance({
      selectedUpdateChannel: di.inject(selectedUpdateChannelInjectable),
      migrations: di.inject(userStoreMigrationsInjectionToken),
    });
  },

  causesSideEffects: true,
});

export default userStoreInjectable;
