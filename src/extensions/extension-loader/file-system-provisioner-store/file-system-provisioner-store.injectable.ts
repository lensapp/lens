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

const fileSystemProvisionerStoreInjectable = getInjectable({
  id: "file-system-provisioner-store",

  instantiate: (di) => new FileSystemProvisionerStore({
    directoryForExtensionData: di.inject(directoryForExtensionDataInjectable),
    ensureDirectory: di.inject(ensureDirectoryInjectable),
    joinPaths: di.inject(joinPathsInjectable),
    randomBytes: di.inject(randomBytesInjectable),
  }),
});

export default fileSystemProvisionerStoreInjectable;
