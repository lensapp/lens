/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { userStoreFileNameMigrationInjectionToken } from "./file-name-migration-injection-token";
import { userPreferencesStoreMigrationsInjectionToken } from "./migrations-injection-token";
import { UserPreferencesStore } from "./store";

const userPreferencesStoreInjectable = getInjectable({
  instantiate: (di) => new UserPreferencesStore({
    fileNameMigration: di.inject(userStoreFileNameMigrationInjectionToken),
    migrations: di.inject(userPreferencesStoreMigrationsInjectionToken),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default userPreferencesStoreInjectable;
