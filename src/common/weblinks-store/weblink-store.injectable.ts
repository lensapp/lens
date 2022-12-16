/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { baseStoreIpcChannelPrefixesInjectionToken } from "../base-store/channel-prefix";
import { shouldBaseStoreDisableSyncInIpcListenerInjectionToken } from "../base-store/disable-sync";
import storeMigrationsInjectable from "../base-store/migrations.injectable";
import { persistStateToConfigInjectionToken } from "../base-store/save-to-file";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../logger.injectable";
import getBasenameOfPathInjectable from "../path/get-basename.injectable";
import { enlistMessageChannelListenerInjectionToken } from "../utils/channel/enlist-message-channel-listener-injection-token";
import storeMigrationVersionInjectable from "../vars/store-migration-version.injectable";
import { weblinkStoreMigrationInjectionToken } from "./migration-token";
import { WeblinkStore } from "./weblink-store";

const weblinkStoreInjectable = getInjectable({
  id: "weblink-store",
  instantiate: (di) => new WeblinkStore({
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
    migrations: di.inject(storeMigrationsInjectable, weblinkStoreMigrationInjectionToken),
    getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
    ipcChannelPrefixes: di.inject(baseStoreIpcChannelPrefixesInjectionToken),
    persistStateToConfig: di.inject(persistStateToConfigInjectionToken),
    enlistMessageChannelListener: di.inject(enlistMessageChannelListenerInjectionToken),
    shouldDisableSyncInListener: di.inject(shouldBaseStoreDisableSyncInIpcListenerInjectionToken),
  }),
});

export default weblinkStoreInjectable;
