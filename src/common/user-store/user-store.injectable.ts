/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { UserStore } from "./user-store";
import selectedUpdateChannelInjectable from "../application-update/selected-update-channel/selected-update-channel.injectable";
import { userStoreMigrationsInjectionToken, userStorePreMigrationsInjectionToken } from "./migrations";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import appVersionInjectable from "../get-configuration-file-model/app-version/app-version.injectable";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../logger.injectable";

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
      logger: di.inject(loggerInjectable),
      appVersion: di.inject(appVersionInjectable),
      directoryForUserData: di.inject(directoryForUserDataInjectable),
      getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    });
  },

  causesSideEffects: true,
});

export default userStoreInjectable;
