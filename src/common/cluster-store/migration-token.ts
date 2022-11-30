/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { MigrationDeclaration } from "../../migrations/helpers";

export const clusterStoreMigrationInjectionToken = getInjectionToken<MigrationDeclaration>({
  id: "cluster-store-migration",
});
