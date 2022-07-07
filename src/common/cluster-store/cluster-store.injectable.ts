/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterStore } from "./cluster-store";
import { createClusterInjectionToken } from "../cluster/create-cluster-injection-token";
import readClusterConfigSyncInjectable from "./read-cluster-config.injectable";
import { clusterStoreMigrationsInjectionToken } from "./migrations";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import appVersionInjectable from "../get-configuration-file-model/app-version/app-version.injectable";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../logger.injectable";

const clusterStoreInjectable = getInjectable({
  id: "cluster-store",

  instantiate: (di) => {
    ClusterStore.resetInstance();

    return ClusterStore.createInstance({
      createCluster: di.inject(createClusterInjectionToken),
      readClusterConfigSync: di.inject(readClusterConfigSyncInjectable),
      migrations: di.inject(clusterStoreMigrationsInjectionToken),
      logger: di.inject(loggerInjectable),
      appVersion: di.inject(appVersionInjectable),
      directoryForUserData: di.inject(directoryForUserDataInjectable),
      getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    });
  },

  causesSideEffects: true,
});

export default clusterStoreInjectable;
