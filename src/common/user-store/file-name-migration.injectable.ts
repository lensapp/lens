/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fse from "fs-extra";
import path from "path";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { isErrnoException } from "../utils";
import { getInjectable } from "@ogre-tools/injectable";

const userStoreFileNameMigrationInjectable = getInjectable({
  id: "user-store-file-name-migration",
  instantiate: (di) => {
    const userDataPath = di.inject(directoryForUserDataInjectable);
    const configJsonPath = path.join(userDataPath, "config.json");
    const lensUserStoreJsonPath = path.join(userDataPath, "lens-user-store.json");

    try {
      fse.moveSync(configJsonPath, lensUserStoreJsonPath);
    } catch (error) {
      if (error instanceof Error && error.message === "dest already exists.") {
        fse.removeSync(configJsonPath);
      } else if (isErrnoException(error) && error.code === "ENOENT" && error.path === configJsonPath) {
        // (No such file or directory)
        return; // file already moved
      } else {
        // pass other errors along
        throw error;
      }
    }
  },
});

export default userStoreFileNameMigrationInjectable;
