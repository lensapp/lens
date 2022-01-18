/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Switch representation of hiddenTableColumns in store
import type { MigrationDeclaration } from "../helpers";

export default {
  version: "5.0.0-alpha.3",
  run(store) {
    const preferences = store.get("preferences");
    const oldHiddenTableColumns: Record<string, string[]> = preferences?.hiddenTableColumns;

    if (!oldHiddenTableColumns) {
      return;
    }

    preferences.hiddenTableColumns = Object.entries(oldHiddenTableColumns);

    store.set("preferences", preferences);
  },
} as MigrationDeclaration;
