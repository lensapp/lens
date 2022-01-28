/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { FileSystemProvisionerStore } from "./file-system-provisioner-store";
import directoryForExtensionDataInjectable from "./directory-for-extension-data.injectable";

const fileSystemProvisionerStoreInjectable = getInjectable({
  instantiate: (di) => new FileSystemProvisionerStore({
    directoryForExtensionData: di.inject(directoryForExtensionDataInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default fileSystemProvisionerStoreInjectable;
