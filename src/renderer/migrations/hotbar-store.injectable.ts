/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationsInjectionToken } from "../../common/hotbars/migrations";

const hotbarStoreMigrationsInjectable = getInjectable({
  id: "hotbar-store-migrations",
  instantiate: () => undefined,
  injectionToken: hotbarStoreMigrationsInjectionToken,
});

export default hotbarStoreMigrationsInjectable;
