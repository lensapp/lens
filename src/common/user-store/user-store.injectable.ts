/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ipcMain } from "electron";
import userStoreFileNameMigrationInjectable from "./file-name-migration.injectable";
import { UserStore } from "./user-store";

const userStoreInjectable = getInjectable({
  id: "user-store",

  instantiate: (di) => {
    UserStore.resetInstance();

    if (ipcMain) {
      di.inject(userStoreFileNameMigrationInjectable);
    }

    return UserStore.createInstance();
  },

  causesSideEffects: true,
});

export default userStoreInjectable;
