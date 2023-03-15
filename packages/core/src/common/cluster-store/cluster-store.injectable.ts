/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterStore } from "./cluster-store";
import readClusterConfigSyncInjectable from "./read-cluster-config.injectable";
import emitAppEventInjectable from "../app-event-bus/emit-event.injectable";
import loggerInjectable from "../logger.injectable";
import storeMigrationVersionInjectable from "../vars/store-migration-version.injectable";
import persistentStorageMigrationsInjectable from "../persistent-storage/migrations.injectable";
import { clusterStoreMigrationInjectionToken } from "./migration-token";
import createPersistentStorageInjectable from "../persistent-storage/create.injectable";

const clusterStoreInjectable = getInjectable({
  id: "cluster-store",

  instantiate: (di) => new ClusterStore({
    readClusterConfigSync: di.inject(readClusterConfigSyncInjectable),
    emitAppEvent: di.inject(emitAppEventInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
    migrations: di.inject(persistentStorageMigrationsInjectable, clusterStoreMigrationInjectionToken),
    createPersistentStorage: di.inject(createPersistentStorageInjectable),
  }),
});

export default clusterStoreInjectable;
