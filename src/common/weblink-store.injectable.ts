/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "./app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "./get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "./logger.injectable";
import storeMigrationVersionInjectable from "./vars/store-migration-version.injectable";
import { WeblinkStore } from "./weblink-store";

const weblinkStoreInjectable = getInjectable({
  id: "weblink-store",
  instantiate: (di) => new WeblinkStore({
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
  }),
});

export default weblinkStoreInjectable;
