/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userStoreMigrationsInjectionToken } from "../../common/user-store/migrations";

const userStoreMigrationsInjectable = getInjectable({
  id: "user-store-migrations",
  instantiate: () => undefined,
  injectionToken: userStoreMigrationsInjectionToken,
});

export default userStoreMigrationsInjectable;
