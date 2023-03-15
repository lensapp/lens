/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogCatalogEntityInjectable from "../catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import { HotbarStore } from "./store";
import loggerInjectable from "../logger.injectable";
import persistentStorageMigrationsInjectable from "../persistent-storage/migrations.injectable";
import { hotbarStoreMigrationInjectionToken } from "./migrations-token";
import createPersistentStorageInjectable from "../persistent-storage/create.injectable";
import storeMigrationVersionInjectable from "../vars/store-migration-version.injectable";

const hotbarStoreInjectable = getInjectable({
  id: "hotbar-store",

  instantiate: (di) => new HotbarStore({
    catalogCatalogEntity: di.inject(catalogCatalogEntityInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
    migrations: di.inject(persistentStorageMigrationsInjectable, hotbarStoreMigrationInjectionToken),
    createPersistentStorage: di.inject(createPersistentStorageInjectable),
  }),
});

export default hotbarStoreInjectable;
