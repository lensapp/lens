/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterModel } from "../../../common/cluster-types";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { isErrnoException } from "../../../common/utils";
import { getInjectable } from "@ogre-tools/injectable";
import { clusterStoreMigrationDeclarationInjectionToken } from "./migration";
import fsInjectable from "../../../common/fs/fs.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";

interface Pre500WorkspaceStoreModel {
  workspaces: {
    id: string;
    name: string;
  }[];
}

const clusterStoreV500Beta10MigrationInjectable = getInjectable({
  id: "clutster-store-v5.0.0-beta.10-migration",
  instantiate: (di) => {
    const userDataPath = di.inject(directoryForUserDataInjectable);
    const { readJsonSync } = di.inject(fsInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return {
      version: "5.0.0-beta.10",
      run(store) {
        try {
          const workspaceData: Pre500WorkspaceStoreModel = readJsonSync(joinPaths(userDataPath, "lens-workspace-store.json"));
          const workspaces = new Map<string, string>(); // mapping from WorkspaceId to name

          for (const { id, name } of workspaceData.workspaces) {
            workspaces.set(id, name);
          }

          const clusters = (store.get("clusters") ?? []) as ClusterModel[];

          for (const cluster of clusters) {
            if (cluster.workspace) {
              const workspace = workspaces.get(cluster.workspace);

              if (workspace) {
                (cluster.labels ??= {}).workspace = workspace;
              }
            }
          }

          store.set("clusters", clusters);
        } catch (error) {
          if (isErrnoException(error) && !(error.code === "ENOENT" && error.path?.endsWith("lens-workspace-store.json"))) {
            // ignore lens-workspace-store.json being missing
            throw error;
          }
        }
      },
    };
  },
  injectionToken: clusterStoreMigrationDeclarationInjectionToken,
});

export default clusterStoreV500Beta10MigrationInjectable;

