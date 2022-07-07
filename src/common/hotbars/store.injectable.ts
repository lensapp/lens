/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogCatalogEntityInjectable from "../catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import { HotbarStore } from "./store";
import loggerInjectable from "../logger.injectable";
import appVersionInjectable from "../get-configuration-file-model/app-version/app-version.injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import { hotbarStoreMigrationsInjectionToken } from "./migrations";

const hotbarStoreInjectable = getInjectable({
  id: "hotbar-store",

  instantiate: (di) => {
    HotbarStore.resetInstance();

    return HotbarStore.createInstance({
      catalogCatalogEntity: di.inject(catalogCatalogEntityInjectable),
      migrations: di.inject(hotbarStoreMigrationsInjectionToken),
      logger: di.inject(loggerInjectable),
      appVersion: di.inject(appVersionInjectable),
      directoryForUserData: di.inject(directoryForUserDataInjectable),
      getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    });
  },

  causesSideEffects: true,
});

export default hotbarStoreInjectable;
