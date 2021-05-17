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

// Cleans up a store that had the state related data stored
import { Hotbar } from "../../common/hotbar-store";
import { ClusterStore } from "../../common/cluster-store";
import { migration } from "../migration-wrapper";
import { v4 as uuid } from "uuid";

export default migration({
  version: "5.0.0-alpha.0",
  run(store) {
    const hotbars: Hotbar[] = [];

    ClusterStore.getInstance().clustersList.forEach((cluster: any) => {
      const name = cluster.workspace;

      if (!name) return;

      let hotbar = hotbars.find((h) => h.name === name);

      if (!hotbar) {
        hotbar = { id: uuid(), name, items: [] };
        hotbars.push(hotbar);
      }

      hotbar.items.push({
        entity: { uid: cluster.id },
        params: {}
      });
    });

    store.set("hotbars", hotbars);
  }
});
