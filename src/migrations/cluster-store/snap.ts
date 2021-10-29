/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Fix embedded kubeconfig paths under snap config

import type { ClusterModel } from "../../common/cluster-types";
import { getAppVersion } from "../../common/utils/app-version";
import fs from "fs";
import { MigrationDeclaration, migrationLog } from "../helpers";

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
