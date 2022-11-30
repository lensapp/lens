/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { MigrationDeclaration } from "../base-store/migrations.injectable";

export const weblinkStoreMigrationInjectionToken = getInjectionToken<MigrationDeclaration>({
  id: "weblink-store-migration-token",
});
