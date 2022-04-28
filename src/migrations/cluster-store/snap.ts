/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Fix embedded kubeconfig paths under snap config

import type { ClusterModel } from "../../common/cluster/types";
import { getAppVersion } from "../../common/utils/app-version";
import fs from "fs";
import type { MigrationDeclaration } from "../helpers";
import { migrationLog } from "../helpers";

export default {
  version: getAppVersion(), // Run always after upgrade
  run(store) {
    if (!process.env["SNAP"]) return;

    migrationLog("Migrating embedded kubeconfig paths");
    const storedClusters: ClusterModel[] = store.get("clusters") || [];

    if (!storedClusters.length) return;

    migrationLog("Number of clusters to migrate: ", storedClusters.length);
    const migratedClusters = storedClusters
      .map(cluster => {
        /**
         * replace snap version with 'current' in kubeconfig path
         */
        if (!fs.existsSync(cluster.kubeConfigPath)) {
          const kubeconfigPath = cluster.kubeConfigPath.replace(/\/snap\/kontena-lens\/[0-9]*\//, "/snap/kontena-lens/current/");

          cluster.kubeConfigPath = kubeconfigPath;
        }

        return cluster;
      });


    store.set("clusters", migratedClusters);
  },
} as MigrationDeclaration;
