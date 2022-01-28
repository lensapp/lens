/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { userPreferencesStoreMigrationsInjectionToken } from "../../common/user-preferences/migrations-injection-token";

const userPreferencesStoreFileNameMigrationInjectable = getInjectable({
  instantiate: () => undefined,
  injectionToken: userPreferencesStoreMigrationsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default userPreferencesStoreFileNameMigrationInjectable;
