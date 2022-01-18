/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fse from "fs-extra";
import path from "path";
import { getLegacyGlobalDiForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import directoryForUserDataInjectable
  from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";

export function fileNameMigration() {
  const di = getLegacyGlobalDiForExtensionApi();

  const userDataPath = di.inject(directoryForUserDataInjectable);
  const configJsonPath = path.join(userDataPath, "config.json");
  const lensUserStoreJsonPath = path.join(userDataPath, "lens-user-store.json");

  try {
    fse.moveSync(configJsonPath, lensUserStoreJsonPath);
  } catch (error) {
    if (error.code === "ENOENT" && error.path === configJsonPath) { // (No such file or directory)
      return; // file already moved
    } else if (error.message === "dest already exists.") {
      fse.removeSync(configJsonPath);
    } else {
      // pass other errors along
      throw error;
    }
  }
}
