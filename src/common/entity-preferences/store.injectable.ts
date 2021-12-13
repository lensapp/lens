/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { baseStoreIpcChannelPrefixesInjectionToken } from "../base-store/channel-prefix";
import { shouldBaseStoreDisableSyncInIpcListenerInjectionToken } from "../base-store/disable-sync";
import { persistStateToConfigInjectionToken } from "../base-store/save-to-file";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../logger.injectable";
import getBasenameOfPathInjectable from "../path/get-basename.injectable";
import { enlistMessageChannelListenerInjectionToken } from "../utils/channel/enlist-message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../utils/channel/message-to-channel-injection-token";
import entityPreferencesStoreMigrationVersionInjectable from "./migration-version.injectable";
import { EntityPreferencesStore } from "./store";

const entityPreferencesStoreInjectable = getInjectable({
  id: "entity-preferences-store",
  instantiate: (di) => new EntityPreferencesStore({
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(entityPreferencesStoreMigrationVersionInjectable),
    getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
    ipcChannelPrefixes: di.inject(baseStoreIpcChannelPrefixesInjectionToken),
    persistStateToConfig: di.inject(persistStateToConfigInjectionToken),
    enlistMessageChannelListener: di.inject(enlistMessageChannelListenerInjectionToken),
    shouldDisableSyncInListener: di.inject(shouldBaseStoreDisableSyncInIpcListenerInjectionToken),
    migrations: {},
    sendMessageToChannel: di.inject(sendMessageToChannelInjectionToken),
  }),
});

export default entityPreferencesStoreInjectable;
