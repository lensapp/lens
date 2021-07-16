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

import type { Hotbar } from "../../common/hotbar-types";
import { catalogEntityRegistry } from "../../main/catalog";
import type { MigrationDeclaration } from "../helpers";

export default {
  version: "5.0.0-beta.5",
  run(store) {
    const hotbars: Hotbar[] = store.get("hotbars") ?? [];

    hotbars.forEach((hotbar, hotbarIndex) => {
      hotbar.items.forEach((item, itemIndex) => {
        const entity = catalogEntityRegistry.items.find((entity) => entity.metadata.uid === item?.entity.uid);

        if (!entity) {
          // Clear disabled item
          hotbars[hotbarIndex].items[itemIndex] = null;
        } else {
          // Save additional data
          hotbars[hotbarIndex].items[itemIndex].entity = {
            ...item.entity,
            name: entity.metadata.name,
            source: entity.metadata.source
          };
        }
      });
    });

    store.set("hotbars", hotbars);
  }
} as MigrationDeclaration;
