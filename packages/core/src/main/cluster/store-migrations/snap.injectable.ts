/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Fix embedded kubeconfig paths under snap config

import { getInjectable } from "@ogre-tools/injectable";
import { clusterStoreMigrationInjectionToken } from "../../../features/cluster/storage/common/migration-token";
import { loggerInjectionToken } from "@k8slens/logger";
import isSnapPackageInjectable from "../../../common/vars/is-snap-package.injectable";
import type { ClusterModel } from "../../../common/cluster-types";
import pathExistsSyncInjectable from "../../../common/fs/path-exists-sync.injectable";
import { applicationInformationToken } from "@k8slens/application";

const clusterStoreSnapMigrationInjectable = getInjectable({
  id: "cluster-store-snap-migration",
  instantiate: (di) => {
    const { version } = di.inject(applicationInformationToken);
    const logger = di.inject(loggerInjectionToken);
    const isSnapPackage = di.inject(isSnapPackageInjectable);
    const pathExistsSync = di.inject(pathExistsSyncInjectable);

    return {
      version, // Run always after upgrade
      run(store) {
        if (!isSnapPackage) {
          return;
        }

        logger.info("Migrating embedded kubeconfig paths");
        const storedClusters = (store.get("clusters") || []) as ClusterModel[];

        if (!storedClusters.length) return;

        logger.info("Number of clusters to migrate: ", storedClusters.length);
        const migratedClusters = storedClusters
          .map(cluster => {
            /**
             * replace snap version with 'current' in kubeconfig path
             */
            if (!pathExistsSync(cluster.kubeConfigPath)) {
              const kubeconfigPath = cluster.kubeConfigPath.replace(/\/snap\/kontena-lens\/[0-9]*\//, "/snap/kontena-lens/current/");

              cluster.kubeConfigPath = kubeconfigPath;
            }

            return cluster;
          });


        store.set("clusters", migratedClusters);
      },
    };
  },
  injectionToken: clusterStoreMigrationInjectionToken,
});

export default clusterStoreSnapMigrationInjectable;

