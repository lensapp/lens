/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as uuid from "uuid";
import type { ClusterStoreModel } from "../../../common/cluster-store/cluster-store";
import type { Hotbar, HotbarItem } from "../../../common/hotbars/types";
import { defaultHotbarCells, getEmptyHotbar } from "../../../common/hotbars/types";
import { getLegacyGlobalDiForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import catalogCatalogEntityInjectable from "../../../common/catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import { isDefined, isErrnoException } from "../../../common/utils";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationInjectionToken } from "../../../common/hotbars/migrations-token";
import readJsonSyncInjectable from "../../../common/fs/read-json-sync.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { generateNewIdFor } from "../../../common/utils/generate-new-id-for";

interface Pre500WorkspaceStoreModel {
  workspaces: {
    id: string;
    name: string;
  }[];
}

interface PartialHotbar {
  id: string;
  name: string;
  items: (null | HotbarItem)[];
}

const v500Beta10HotbarStoreMigrationInjectable = getInjectable({
  id: "v5.0.0-beta.10-hotbar-store-migration",
  instantiate: (di) => {
    const userDataPath = di.inject(directoryForUserDataInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const readJsonSync = di.inject(readJsonSyncInjectable);
    const catalogCatalogEntity = di.inject(catalogCatalogEntityInjectable);
    const logger = di.inject(loggerInjectable);

    return {
      version: "5.0.0-beta.10",
      run(store) {
        const rawHotbars = store.get("hotbars");
        const hotbars: Hotbar[] = Array.isArray(rawHotbars) ? rawHotbars.filter(h => h && typeof h === "object") : [];


        // Hotbars might be empty, if some of the previous migrations weren't run
        if (hotbars.length === 0) {
          const hotbar = getEmptyHotbar("default");
          const { metadata: { uid, name, source }} = catalogCatalogEntity;

          hotbar.items[0] = { entity: { uid, name, source }};

          hotbars.push(hotbar);
        }

        try {
          const workspaceStoreData: Pre500WorkspaceStoreModel = readJsonSync(joinPaths(userDataPath, "lens-workspace-store.json"));
          const { clusters = [] }: ClusterStoreModel = readJsonSync(joinPaths(userDataPath, "lens-cluster-store.json"));
          const workspaceHotbars = new Map<string, PartialHotbar>(); // mapping from WorkspaceId to HotBar

          for (const { id, name } of workspaceStoreData.workspaces) {
            logger.info(`Creating new hotbar for ${name}`);
            workspaceHotbars.set(id, {
              id: uuid.v4(), // don't use the old IDs as they aren't necessarily UUIDs
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

            hotbars.push(hotbar as Hotbar);
          }

          /**
       * Finally, make sure that the catalog entity hotbar item is in place.
       * Just in case something else removed it.
       *
       * if every hotbar has elements that all not the `catalog-entity` item
       */
          if (hotbars.every(hotbar => hotbar.items.every(item => item?.entity?.uid !== "catalog-entity"))) {
            // note, we will add a new whole hotbar here called "default" if that was previously removed
            const di = getLegacyGlobalDiForExtensionApi();
            const catalogCatalogEntity = di.inject(catalogCatalogEntityInjectable);

            const defaultHotbar = hotbars.find(hotbar => hotbar.name === "default");
            const { metadata: { uid, name, source }} = catalogCatalogEntity;

            if (defaultHotbar) {
              const freeIndex = defaultHotbar.items.findIndex(i => i === null);

              if (freeIndex === -1) {
                // making a new hotbar is less destructive if the first hotbar
                // called "default" is full than overriding a hotbar item
                const hotbar = getEmptyHotbar("initial");

                hotbar.items[0] = { entity: { uid, name, source }};
                hotbars.unshift(hotbar);
              } else {
                defaultHotbar.items[freeIndex] = { entity: { uid, name, source }};
              }
            } else {
              const hotbar = getEmptyHotbar("default");

              hotbar.items[0] = { entity: { uid, name, source }};
              hotbars.unshift(hotbar);
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
    };
  },
  injectionToken: hotbarStoreMigrationInjectionToken,
});

export default v500Beta10HotbarStoreMigrationInjectable;

