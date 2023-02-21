/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { FileSystemProvisionerStore } from "./file-system-provisioner-store";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import storeMigrationVersionInjectable from "../../../common/vars/store-migration-version.injectable";
import { baseStoreIpcChannelPrefixesInjectionToken } from "../../../common/base-store/channel-prefix";
import { shouldBaseStoreDisableSyncInIpcListenerInjectionToken } from "../../../common/base-store/disable-sync";
import { persistStateToConfigInjectionToken } from "../../../common/base-store/save-to-file";
import getBasenameOfPathInjectable from "../../../common/path/get-basename.injectable";
import { enlistMessageChannelListenerInjectionToken } from "../../../common/utils/channel/enlist-message-channel-listener-injection-token";
import ensureHashedDirectoryForExtensionInjectable from "./ensure-hashed-directory-for-extension.injectable";
import { registeredExtensionsInjectable } from "./registered-extensions.injectable";

const fileSystemProvisionerStoreInjectable = getInjectable({
  id: "file-system-provisioner-store",

  instantiate: (di) => new FileSystemProvisionerStore({
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
    migrations: {},
    getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
    ipcChannelPrefixes: di.inject(baseStoreIpcChannelPrefixesInjectionToken),
    persistStateToConfig: di.inject(persistStateToConfigInjectionToken),
    enlistMessageChannelListener: di.inject(enlistMessageChannelListenerInjectionToken),
    shouldDisableSyncInListener: di.inject(shouldBaseStoreDisableSyncInIpcListenerInjectionToken),
    ensureHashedDirectoryForExtension: di.inject(ensureHashedDirectoryForExtensionInjectable),
    registeredExtensions: di.inject(registeredExtensionsInjectable),
  }),
});

export default fileSystemProvisionerStoreInjectable;
