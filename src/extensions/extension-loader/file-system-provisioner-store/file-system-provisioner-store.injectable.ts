/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { FileSystemProvisionerStore } from "./file-system-provisioner-store";
import directoryForExtensionDataInjectable from "./directory-for-extension-data.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import appVersionInjectable from "../../../common/get-configuration-file-model/app-version/app-version.injectable";
import getConfigurationFileModelInjectable from "../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../../../common/logger.injectable";

const fileSystemProvisionerStoreInjectable = getInjectable({
  id: "file-system-provisioner-store",

  instantiate: (di) => {
    FileSystemProvisionerStore.resetInstance();

    return FileSystemProvisionerStore.createInstance({
      directoryForExtensionData: di.inject(directoryForExtensionDataInjectable),
      logger: di.inject(loggerInjectable),
      appVersion: di.inject(appVersionInjectable),
      directoryForUserData: di.inject(directoryForUserDataInjectable),
      getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    });
  },

  causesSideEffects: true,
});

export default fileSystemProvisionerStoreInjectable;
