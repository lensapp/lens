/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { userStoreMigrationDeclarationInjectionToken } from "./migration";

const userStoreV210Beta4MigrationInjectable = getInjectable({
  id: "user-store-v2.1.0-beta.4-migration",
  instantiate: () => ({
    version: "2.1.0-beta.4",
    run(store) {
      store.set("lastSeenAppVersion", "0.0.0");
    },
  }),
  injectionToken: userStoreMigrationDeclarationInjectionToken,
});

export default userStoreV210Beta4MigrationInjectable;

