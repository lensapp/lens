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
import fse from "fs-extra";
import path from "path";
import * as uuid from "uuid";
import type { ClusterStoreModel } from "../../common/cluster-store";
import { defaultHotbarCells, Hotbar } from "../../common/hotbar-store";
import type { MigrationDeclaration } from "../helpers";

interface Pre500WorkspaceStoreModel {
  workspaces: {
    id: string;
    name: string;
  }[];
}

export default {
  version: "5.0.0-beta.10",
  run(store) {
    const hotbars: Hotbar[] = store.get("hotbars");
    const userDataPath = app.getPath("userData");

    try {
      const workspaceStoreData: Pre500WorkspaceStoreModel = fse.readJsonSync(path.join(userDataPath, "lens-workspace-store.json"));
      const { clusters }: ClusterStoreModel = fse.readJSONSync(path.join(userDataPath, "lens-cluster-store.json"));
      const workspaceHotbars = new Map<string, Hotbar>(); // mapping from WorkspaceId to HotBar

      for (const { id, name } of workspaceStoreData.workspaces) {
        workspaceHotbars.set(id, {
          id: uuid.v4(), // don't use the old IDs as they aren't necessarily UUIDs
          items: [],
          name,
        });
      }

      for (const cluster of clusters) {
        const workspaceHotbar = workspaceHotbars.get(cluster.workspace);

        if (workspaceHotbar?.items.length < defaultHotbarCells) {
          workspaceHotbar.items.push({
            entity: {
              uid: cluster.id,
              name: cluster.preferences.clusterName || cluster.contextName,
            }
          });
        }
      }

      for (const hotbar of workspaceHotbars.values()) {
        while (hotbar.items.length < defaultHotbarCells) {
          hotbar.items.push(null);
        }

        hotbars.push(hotbar);
      }

      store.set("hotbars", hotbars);
    } catch (error) {
      if (!(error.code === "ENOENT" && error.path.endsWith("lens-workspace-store.json"))) {
        // ignore lens-workspace-store.json being missing
        throw error;
      }
    }
  }
} as MigrationDeclaration;
