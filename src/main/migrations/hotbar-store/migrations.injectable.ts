/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import joinMigrationsInjectable from "../join.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationsInjectionToken } from "../../../common/hotbars/migrations";
import { hotbarStoreMigrationDeclarationInjectionToken } from "./migration";

const hotbarStoreMigrationsInjectable = getInjectable({
  id: "hotbar-store-migrations",
  instantiate: (di) => {
    const joinMigrations = di.inject(joinMigrationsInjectable);
    const migrationDeclarations = di.injectMany(hotbarStoreMigrationDeclarationInjectionToken);

    return joinMigrations(migrationDeclarations);
  },
  injectionToken: hotbarStoreMigrationsInjectionToken,
});

export default hotbarStoreMigrationsInjectable;
