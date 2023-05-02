/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as uuid from "uuid";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import catalogCatalogEntityInjectable from "../../../../common/catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import { isDefined, isErrnoException } from "@k8slens/utilities";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationInjectionToken } from "../common/migrations-token";
import readJsonSyncInjectable from "../../../../common/fs/read-json-sync.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { generateNewIdFor } from "../../../../common/utils/generate-new-id-for";
import type { ClusterModel } from "../../../../common/cluster-types";
import { defaultHotbarCells } from "../common/types";
import type { HotbarData } from "../common/hotbar";
import createHotbarInjectable from "../common/create-hotbar.injectable";

interface Pre500WorkspaceStoreModel {
  workspaces: {
    id: string;
    name: string;
  }[];
}

interface Pre500ClusterModel extends ClusterModel {
  workspace?: string;
  workspaces?: string[];
}

interface Pre500ClusterStoreModel {
  clusters?: Pre500ClusterModel[];
}

const v500Beta10HotbarStoreMigrationInjectable = getInjectable({
  id: "v5.0.0-beta.10-hotbar-store-migration",
  instantiate: (di) => ({
    version: "5.0.0-beta.10",
    run(store) {
      const userDataPath = di.inject(directoryForUserDataInjectable);
      const joinPaths = di.inject(joinPathsInjectable);
      const readJsonSync = di.inject(readJsonSyncInjectable);
      const catalogCatalogEntity = di.inject(catalogCatalogEntityInjectable);
      const logger = di.inject(loggerInjectionToken);
      const createHotbar = di.inject(createHotbarInjectable);
      const rawHotbars = store.get("hotbars");
      const hotbars: HotbarData[] = Array.isArray(rawHotbars) ? rawHotbars.filter(h => h && typeof h === "object") : [];

      // Hotbars might be empty, if some of the previous migrations weren't run
      if (hotbars.length === 0) {
        const hotbar = createHotbar({ name: "default" });

        hotbar.addEntity(catalogCatalogEntity);
        hotbars.push(hotbar.toJSON());
      }

      try {
        const workspaceStoreData: Pre500WorkspaceStoreModel = readJsonSync(joinPaths(userDataPath, "lens-workspace-store.json"));
        const { clusters = [] }: Pre500ClusterStoreModel = readJsonSync(joinPaths(userDataPath, "lens-cluster-store.json"));
        const workspaceHotbars = new Map<string, HotbarData>(); // mapping from WorkspaceId to HotBar

        for (const { id, name } of workspaceStoreData.workspaces) {
          logger.info(`Creating new hotbar for ${name}`);
          workspaceHotbars.set(id, {
            id: uuid.v4(),
            items: [],
            name: `Workspace: ${name}`,
          });
        }

        {
          // grab the default named hotbar or the first.
          const defaultHotbarIndex = Math.max(0, hotbars.findIndex(hotbar => hotbar.name === "default"));
          const [{ name, id, items }] = hotbars.splice(defaultHotbarIndex, 1);

          workspaceHotbars.set("default", {
            name,
            id,
            items: items.filter(isDefined),
          });
        }

        for (const cluster of clusters) {
          const uid = generateNewIdFor(cluster);

          for (const workspaceId of cluster.workspaces ?? [cluster.workspace].filter(isDefined)) {
            const workspaceHotbar = workspaceHotbars.get(workspaceId);

            if (!workspaceHotbar) {
              logger.info(`Cluster ${uid} has unknown workspace ID, skipping`);
              continue;
            }

            logger.info(`Adding cluster ${uid} to ${workspaceHotbar.name}`);

            if (workspaceHotbar?.items.length < defaultHotbarCells) {
              workspaceHotbar.items.push({
                entity: {
                  uid: generateNewIdFor(cluster),
                  name: cluster.preferences?.clusterName || cluster.contextName,
                },
              });
            }
          }
        }

        for (const hotbar of workspaceHotbars.values()) {
          if (hotbar.items.length === 0) {
            logger.info(`Skipping ${hotbar.name} due to it being empty`);
            continue;
          }

          while (hotbar.items.length < defaultHotbarCells) {
            hotbar.items.push(null);
          }

          hotbars.push(hotbar);
        }

        /**
         * Finally, make sure that the catalog entity hotbar item is in place.
         * Just in case something else removed it.
         *
         * if every hotbar has elements that all not the `catalog-entity` item
         */
        if (hotbars.every(hotbar => hotbar.items.every(item => item?.entity?.uid !== "catalog-entity"))) {
          // note, we will add a new whole hotbar here called "default" if that was previously removed
          const defaultHotbarIndex = hotbars.findIndex(hotbar => hotbar.name === "default");

          if (defaultHotbarIndex >= 0) {
            const defaultHotbar = createHotbar(hotbars[defaultHotbarIndex]);

            if (defaultHotbar.isFull()) {
              // making a new hotbar is less destructive if the first hotbar
              // called "default" is full than overriding a hotbar item
              const hotbar = createHotbar({ name: "initial" });

              hotbar.addEntity(catalogCatalogEntity);
              hotbars.unshift(hotbar.toJSON());
            } else {
              defaultHotbar.addEntity(catalogCatalogEntity);
              hotbars[defaultHotbarIndex] = defaultHotbar.toJSON();
            }
          } else {
            const hotbar = createHotbar({ name: "default" });

            hotbar.addEntity(catalogCatalogEntity);
            hotbars.unshift(hotbar.toJSON());
          }
        }

      } catch (error) {
        // ignore files being missing
        if (isErrnoException(error) && error.code !== "ENOENT") {
          throw error;
        }
      }

      store.set("hotbars", hotbars);
    },
  }),
  injectionToken: hotbarStoreMigrationInjectionToken,
});

export default v500Beta10HotbarStoreMigrationInjectable;

