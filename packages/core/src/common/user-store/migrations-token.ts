/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { MigrationDeclaration } from "../base-store/migrations.injectable";

export const userStoreMigrationInjectionToken = getInjectionToken<MigrationDeclaration>({
  id: "user-store-migration-token",
});
