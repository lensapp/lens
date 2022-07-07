/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import joinMigrationsInjectable from "../join.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { weblinksStoreMigrationDeclarationInjectionToken } from "./migration";
import { weblinksStoreMigrationsInjectionToken } from "../../../common/weblinks/migrations";

const weblinksStoreMigrationsInjectable = getInjectable({
  id: "weblinks-store-migrations",
  instantiate: (di) => {
    const joinMigrations = di.inject(joinMigrationsInjectable);
    const migrationDeclarations = di.injectMany(weblinksStoreMigrationDeclarationInjectionToken);

    return joinMigrations(migrationDeclarations);
  },
  injectionToken: weblinksStoreMigrationsInjectionToken,
});

export default weblinksStoreMigrationsInjectable;

