/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { isErrnoException } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import fsInjectable from "../../../common/fs/fs.injectable";

export type UserStoreFileNameMigration = () => Promise<void>;

const userPreferencesStorageFileNameMigrationInjectable = getInjectable({
  id: "preferences-storage-file-name-migration",
  instantiate: (di): UserStoreFileNameMigration => {
    const userDataPath = di.inject(directoryForUserDataInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const configJsonPath = joinPaths(userDataPath, "config.json");
    const lensUserStoreJsonPath = joinPaths(userDataPath, "lens-user-store.json");
    const { rename, rm } = di.inject(fsInjectable);

    return async () => {
      try {
        await rename(configJsonPath, lensUserStoreJsonPath);
      } catch (error) {
        if (error instanceof Error && error.message === "dest already exists.") {
          await rm(configJsonPath);
        } else if (isErrnoException(error) && error.code === "ENOENT" && error.path === configJsonPath) {
          // (No such file or directory)
          return; // file already moved
        } else {
          // pass other errors along
          throw error;
        }
      }
    };
  },
});

export default userPreferencesStorageFileNameMigrationInjectable;
