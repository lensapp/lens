/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { MigrationDeclaration } from "../../../features/persistent-storage/common/migrations.injectable";

export const fileSystemProvisionerStoreMigrationDeclarationInjectionToken = getInjectionToken<MigrationDeclaration>({
  id: "file-system-provisioner-store-migration-declaration",
});
