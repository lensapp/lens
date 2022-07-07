/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { hasTypedProperty, isObject } from "../../../common/utils";
import { getInjectable } from "@ogre-tools/injectable";
import { userStoreMigrationDeclarationInjectionToken } from "./migration";

const userStoreV500Alpha3MigrationInjectable = getInjectable({
  id: "user-store-v5.0.0-alpha.3-migration",
  instantiate: () => ({
    version: "5.0.0-alpha.3",
    run(store) {
      const preferences = store.get("preferences");

      if (!isObject(preferences)) {
        store.delete("preferences");
      } else if (hasTypedProperty(preferences, "hiddenTableColumns", isObject)) {
        preferences.hiddenTableColumns = Object.entries(preferences.hiddenTableColumns);

        store.set("preferences", preferences);
      }
    },
  }),
  injectionToken: userStoreMigrationDeclarationInjectionToken,
});

export default userStoreV500Alpha3MigrationInjectable;

