/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { FileSystemProvisionerStore } from "./file-system-provisioner-store";
import directoryForExtensionDataInjectable from "./directory-for-extension-data.injectable";
import ensureDirectoryInjectable from "../../../common/fs/ensure-dir.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import randomBytesInjectable from "../../../common/utils/random-bytes.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import storeMigrationVersionInjectable from "../../../common/vars/store-migration-version.injectable";

const fileSystemProvisionerStoreInjectable = getInjectable({
  id: "file-system-provisioner-store",

  instantiate: (di) => new FileSystemProvisionerStore({
    directoryForExtensionData: di.inject(directoryForExtensionDataInjectable),
    ensureDirectory: di.inject(ensureDirectoryInjectable),
    joinPaths: di.inject(joinPathsInjectable),
    randomBytes: di.inject(randomBytesInjectable),
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
  }),
});

export default fileSystemProvisionerStoreInjectable;
