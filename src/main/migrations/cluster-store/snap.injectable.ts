/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Fix embedded kubeconfig paths under snap config

import type { ClusterModel } from "../../../common/cluster-types";
import { getInjectable } from "@ogre-tools/injectable";
import { clusterStoreMigrationDeclarationInjectionToken } from "./migration";
import migrationLogInjectable from "../log.injectable";
import appVersionInjectable from "../../../common/get-configuration-file-model/app-version/app-version.injectable";
import fsInjectable from "../../../common/fs/fs.injectable";

const clusterStoreSnapMigrationInjectable = getInjectable({
  id: "cluster-store-snap-migration",
  instantiate: (di) => {
    const migrationLog = di.inject(migrationLogInjectable);
    const { existsSync } = di.inject(fsInjectable);

    return {
      version: di.inject(appVersionInjectable), // Run always after upgrade
      run(store) {
        if (!process.env.SNAP) return;

        migrationLog("Migrating embedded kubeconfig paths");
        const storedClusters = (store.get("clusters") || []) as ClusterModel[];

        if (!storedClusters.length) return;

        migrationLog("Number of clusters to migrate: ", storedClusters.length);
        const migratedClusters = storedClusters
          .map(cluster => {
            /**
             * replace snap version with 'current' in kubeconfig path
             */
            if (!existsSync(cluster.kubeConfigPath)) {
              const kubeconfigPath = cluster.kubeConfigPath.replace(/\/snap\/kontena-lens\/[0-9]*\//, "/snap/kontena-lens/current/");

              cluster.kubeConfigPath = kubeconfigPath;
            }

            return cluster;
          });


        store.set("clusters", migratedClusters);
      },
    };
  },
  injectionToken: clusterStoreMigrationDeclarationInjectionToken,
});

export default clusterStoreSnapMigrationInjectable;

