/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { FileSystemProvisionerStore } from "./file-system-provisioner-store";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { baseStoreIpcChannelPrefixesInjectionToken } from "../../../common/base-store/channel-prefix";
import { shouldBaseStoreDisableSyncInIpcListenerInjectionToken } from "../../../common/base-store/disable-sync";
import { persistStateToConfigInjectionToken } from "../../../common/base-store/save-to-file";
import getBasenameOfPathInjectable from "../../../common/path/get-basename.injectable";
import { enlistMessageChannelListenerInjectionToken } from "../../../common/utils/channel/enlist-message-channel-listener-injection-token";
import fileSystemProvisionerStoreMigrationVersionInjectable from "./migration-version.injectable";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import ensureHashedDirectoryForExtensionInjectable from "./ensure-hashed-directory-for-extension.injectable";

const fileSystemProvisionerStoreInjectable = getInjectable({
  id: "file-system-provisioner-store",

  instantiate: (di) => new FileSystemProvisionerStore({
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(fileSystemProvisionerStoreMigrationVersionInjectable),
    migrations: {},
    getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
    ipcChannelPrefixes: di.inject(baseStoreIpcChannelPrefixesInjectionToken),
    persistStateToConfig: di.inject(persistStateToConfigInjectionToken),
    enlistMessageChannelListener: di.inject(enlistMessageChannelListenerInjectionToken),
    shouldDisableSyncInListener: di.inject(shouldBaseStoreDisableSyncInIpcListenerInjectionToken),
    sendMessageToChannel: di.inject(sendMessageToChannelInjectionToken),
    ensureHashedDirectoryForExtension: di.inject(ensureHashedDirectoryForExtensionInjectable),
  }),
});

export default fileSystemProvisionerStoreInjectable;
