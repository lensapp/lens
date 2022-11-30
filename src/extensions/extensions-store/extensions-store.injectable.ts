/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../../common/logger.injectable";
import storeMigrationVersionInjectable from "../../common/vars/store-migration-version.injectable";
import { ExtensionsStore } from "./extensions-store";

const extensionsStoreInjectable = getInjectable({
  id: "extensions-store",
  instantiate: (di) => new ExtensionsStore({
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
  }),
});

export default extensionsStoreInjectable;
