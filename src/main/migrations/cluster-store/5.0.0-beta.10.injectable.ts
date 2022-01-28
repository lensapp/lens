/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import fse from "fs-extra";
import type { ClusterModel } from "../../../common/cluster-types";
import type { MigrationDeclaration } from "../helpers";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data.injectable";
import type { ClusterStoreModel } from "../../../common/cluster-store/store";

interface Pre500WorkspaceStoreModel {
  workspaces: {
    id: string;
    name: string;
  }[];
}

interface Dependencies {
  userDataPath: string;
}

function getMigration({ userDataPath }: Dependencies): MigrationDeclaration<ClusterStoreModel> {
  return {
    version: "5.0.0-beta.10",
    run(store) {
      try {
        const workspaceData: Pre500WorkspaceStoreModel = fse.readJsonSync(path.join(userDataPath, "lens-workspace-store.json"));
        const workspaces = new Map<string, string>(); // mapping from WorkspaceId to name

        for (const { id, name } of workspaceData.workspaces) {
          workspaces.set(id, name);
        }

        const clusters: ClusterModel[] = store.get("clusters") ?? [];

        for (const cluster of clusters) {
          if (cluster.workspace && workspaces.has(cluster.workspace)) {
            cluster.labels ??= {};
            cluster.labels.workspace = workspaces.get(cluster.workspace);
          }
        }

        store.set("clusters", clusters);
      } catch (error) {
        if (!(error.code === "ENOENT" && error.path.endsWith("lens-workspace-store.json"))) {
          // ignore lens-workspace-store.json being missing
          throw error;
        }
      }
    },
  };
}

const version500Beta10MigrationInjectable = getInjectable({
  instantiate: (di) => getMigration({
    userDataPath: di.inject(directoryForUserDataInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default version500Beta10MigrationInjectable;
