/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const hotbarStoreMigrationVersionInjectable = getInjectable({
  id: "hotbar-store-migration-version",
  instantiate: () => "6.4.0",
});

export default hotbarStoreMigrationVersionInjectable;
