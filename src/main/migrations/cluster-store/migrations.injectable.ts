/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cluster store migrations

import joinMigrationsInjectable from "../join.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { clusterStoreMigrationDeclarationInjectionToken } from "./migration";

const clusterStoreMigrationsInjectable = getInjectable({
  id: "cluster-store-migrations",
  instantiate: (di) => {
    const joinMigrations = di.inject(joinMigrationsInjectable);
    const migrationDeclarations = di.injectMany(clusterStoreMigrationDeclarationInjectionToken);

    return joinMigrations(migrationDeclarations);
  },
});

export default clusterStoreMigrationsInjectable;

