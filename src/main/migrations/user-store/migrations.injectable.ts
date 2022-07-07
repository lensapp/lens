/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import joinMigrationsInjectable from "../join.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { userStoreMigrationDeclarationInjectionToken } from "./migration";
import { userStoreMigrationsInjectionToken } from "../../../common/user-store/migrations";

const userStoreMigrationsInjectable = getInjectable({
  id: "user-store-migrations",
  instantiate: (di) => {
    const joinMigrations = di.inject(joinMigrationsInjectable);
    const migrationDeclarataions = di.injectMany(userStoreMigrationDeclarationInjectionToken);

    return joinMigrations(migrationDeclarataions);
  },
  injectionToken: userStoreMigrationsInjectionToken,
});

export default userStoreMigrationsInjectable;

