/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fse from "fs-extra";
import path from "path";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../common/utils";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data.injectable";
import { userStoreFileNameMigrationInjectionToken } from "../../../common/user-preferences/file-name-migration-injection-token";

interface Dependencies {
  userDataPath: string;
}

function fileNameMigration({ userDataPath }: Dependencies) {
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

const fileNameMigrationInjectable = getInjectable({
  instantiate: (di) => bind(fileNameMigration, null, {
    userDataPath: di.inject(directoryForUserDataInjectable),
  }),
  injectionToken: userStoreFileNameMigrationInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default fileNameMigrationInjectable;

