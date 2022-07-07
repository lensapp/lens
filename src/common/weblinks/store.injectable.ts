/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import appVersionInjectable from "../get-configuration-file-model/app-version/app-version.injectable";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../logger.injectable";
import { weblinksStoreMigrationsInjectionToken } from "./migrations";
import { WeblinkStore } from "./store";

const weblinkStoreInjectable = getInjectable({
  id: "weblink-store",

  instantiate: (di) => {
    WeblinkStore.resetInstance();

    return WeblinkStore.createInstance({
      migrations: di.inject(weblinksStoreMigrationsInjectionToken),
      logger: di.inject(loggerInjectable),
      appVersion: di.inject(appVersionInjectable),
      directoryForUserData: di.inject(directoryForUserDataInjectable),
      getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    });
  },
});

export default weblinkStoreInjectable;
