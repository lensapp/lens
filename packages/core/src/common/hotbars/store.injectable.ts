/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogCatalogEntityInjectable from "../catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import { HotbarStore } from "./store";
import loggerInjectable from "../logger.injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import storeMigrationVersionInjectable from "../vars/store-migration-version.injectable";
import storeMigrationsInjectable from "../base-store/migrations.injectable";
import { hotbarStoreMigrationInjectionToken } from "./migrations-token";
import getBasenameOfPathInjectable from "../path/get-basename.injectable";
import { baseStoreIpcChannelPrefixesInjectionToken } from "../base-store/channel-prefix";
import { persistStateToConfigInjectionToken } from "../base-store/save-to-file";
import { enlistMessageChannelListenerInjectionToken } from "../utils/channel/enlist-message-channel-listener-injection-token";
import { shouldBaseStoreDisableSyncInIpcListenerInjectionToken } from "../base-store/disable-sync";

const hotbarStoreInjectable = getInjectable({
  id: "hotbar-store",

  instantiate: (di) => new HotbarStore({
    catalogCatalogEntity: di.inject(catalogCatalogEntityInjectable),
    logger: di.inject(loggerInjectable),
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
    migrations: di.inject(storeMigrationsInjectable, hotbarStoreMigrationInjectionToken),
    getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
    ipcChannelPrefixes: di.inject(baseStoreIpcChannelPrefixesInjectionToken),
    persistStateToConfig: di.inject(persistStateToConfigInjectionToken),
    enlistMessageChannelListener: di.inject(enlistMessageChannelListenerInjectionToken),
    shouldDisableSyncInListener: di.inject(shouldBaseStoreDisableSyncInIpcListenerInjectionToken),
  }),
});

export default hotbarStoreInjectable;
