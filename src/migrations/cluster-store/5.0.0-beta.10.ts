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

import path from "path";
import { app } from "electron";
import fse from "fs-extra";
import type { ClusterModel } from "../../common/cluster-store";
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
    const userDataPath = app.getPath("userData");

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
} as MigrationDeclaration;
