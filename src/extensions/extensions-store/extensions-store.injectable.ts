/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { baseStoreIpcChannelPrefixesInjectionToken } from "../../common/base-store/channel-prefix";
import { shouldBaseStoreDisableSyncInIpcListenerInjectionToken } from "../../common/base-store/disable-sync";
import { persistStateToConfigInjectionToken } from "../../common/base-store/save-to-file";
import getConfigurationFileModelInjectable from "../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../../common/logger.injectable";
import getBasenameOfPathInjectable from "../../common/path/get-basename.injectable";
import { enlistMessageChannelListenerInjectionToken } from "../../common/utils/channel/enlist-message-channel-listener-injection-token";
import storeMigrationVersionInjectable from "../../common/vars/store-migration-version.injectable";
import { ExtensionsStore } from "./extensions-store";

const extensionsStoreInjectable = getInjectable({
  id: "extensions-store",
  instantiate: (di) => new ExtensionsStore({
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
  }),
});

export default extensionsStoreInjectable;
