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

import { app } from "electron";
import { existsSync, readJsonSync } from "fs-extra";
import path from "path";
import os from "os";
import { ClusterStore, ClusterStoreModel } from "../../common/cluster-store";
import type { KubeconfigSyncEntry, UserPreferencesModel } from "../../common/user-store";
import { MigrationDeclaration, migrationLog } from "../helpers";

export default {
  version: "5.0.3-beta.1",
  run(store) {
    try {
      const { syncKubeconfigEntries = [], ...preferences }: UserPreferencesModel = store.get("preferences") ?? {};
      const { clusters = [] }: ClusterStoreModel = readJsonSync(path.resolve(app.getPath("userData"), "lens-cluster-store.json")) ?? {};
      const syncPaths = new Set(syncKubeconfigEntries.map(s => s.filePath));

      syncPaths.add(path.join(os.homedir(), ".kube"));

      for (const cluster of clusters) {
        const dirOfKubeconfig = path.dirname(cluster.kubeConfigPath);

        if (dirOfKubeconfig === ClusterStore.storedKubeConfigFolder) {
          migrationLog(`Skipping ${cluster.id} because kubeConfigPath is under ClusterStore.storedKubeConfigFolder`);
          continue;
        }

        if (syncPaths.has(cluster.kubeConfigPath) || syncPaths.has(dirOfKubeconfig)) {
          migrationLog(`Skipping ${cluster.id} because kubeConfigPath is already being synced`);
          continue;
        }

        if (!existsSync(cluster.kubeConfigPath)) {
          migrationLog(`Skipping ${cluster.id} because kubeConfigPath no longer exists`);
          continue;
        }

        migrationLog(`Adding ${cluster.kubeConfigPath} from ${cluster.id} to sync paths`);
        syncPaths.add(cluster.kubeConfigPath);
      }

      const updatedSyncEntries: KubeconfigSyncEntry[] = [...syncPaths].map(filePath => ({ filePath }));

      migrationLog("Final list of synced paths", updatedSyncEntries);
      store.set("preferences", { ...preferences, syncKubeconfigEntries: updatedSyncEntries });
    } catch (error) {
      console.log(error);

      if (error.code !== "ENOENT") {
        // ignore files being missing
        throw error;
      }
    }
  },
} as MigrationDeclaration;
