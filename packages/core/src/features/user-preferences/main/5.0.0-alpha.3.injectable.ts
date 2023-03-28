/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Switch representation of hiddenTableColumns in store
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesMigrationInjectionToken } from "../common/migrations-token";

interface PreV500Alpha3UserPreferencesModel {
  hiddenTableColumns?: Record<string, string[]>;
}

const v500Alpha3UserPreferencesStorageMigrationInjectable = getInjectable({
  id: "v5.0.0-alpha.3-preferences-storage-migration",
  instantiate: () => ({
    version: "5.0.0-alpha.3",
    run(store) {
      const preferences = (store.get("preferences") ?? {}) as PreV500Alpha3UserPreferencesModel;
      const oldHiddenTableColumns = preferences.hiddenTableColumns;

      if (!oldHiddenTableColumns) {
        return;
      }

      store.set("preferences", {
        ...preferences,
        hiddenTableColumns: Object.entries(oldHiddenTableColumns),
      });
    },
  }),
  injectionToken: userPreferencesMigrationInjectionToken,
});

export default v500Alpha3UserPreferencesStorageMigrationInjectable;

