/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createPersistentStorageInjectable from "../persistent-storage/create.injectable";
import persistentStorageMigrationsInjectable from "../persistent-storage/migrations.injectable";
import storeMigrationVersionInjectable from "../vars/store-migration-version.injectable";
import { weblinkStoreMigrationInjectionToken } from "./migration-token";
import { WeblinkStore } from "./weblink-store";

const weblinkStoreInjectable = getInjectable({
  id: "weblink-store",
  instantiate: (di) => new WeblinkStore({
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
    migrations: di.inject(persistentStorageMigrationsInjectable, weblinkStoreMigrationInjectionToken),
    createPersistentStorage: di.inject(createPersistentStorageInjectable),
  }),
});

export default weblinkStoreInjectable;
