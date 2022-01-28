/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Switch representation of hiddenTableColumns in store
import type { UserPreferencesStoreModel } from "../../../common/user-preferences";
import type { MigrationDeclaration } from "../helpers";

export default {
  version: "5.0.0-alpha.3",
  run(store) {
    const preferences = store.get("preferences");
    const oldHiddenTableColumns = preferences?.hiddenTableColumns as any as Record<string, string[]>;

    if (!oldHiddenTableColumns) {
      return;
    }

    preferences.hiddenTableColumns = Object.entries(oldHiddenTableColumns);

    store.set("preferences", preferences);
  },
} as MigrationDeclaration<UserPreferencesStoreModel>;
