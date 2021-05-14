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

import { reaction, toJS } from "mobx";
import { broadcastMessage, subscribeToBroadcast, unsubscribeFromBroadcast } from "../common/ipc";
import type { CatalogEntityRegistry} from "../common/catalog";
import "../common/catalog-entities/kubernetes-cluster";
import type { Disposer } from "../common/utils";

export class CatalogPusher {
  static init(catalog: CatalogEntityRegistry) {
    new CatalogPusher(catalog).init();
  }

  private constructor(private catalog: CatalogEntityRegistry) {}

  init() {
    const disposers: Disposer[] = [];

    disposers.push(reaction(() => toJS(this.catalog.items, { recurseEverything: true }), (items) => {
      broadcastMessage("catalog:items", items);
    }, {
      fireImmediately: true,
    }));

    const listener = subscribeToBroadcast("catalog:broadcast", () => {
      broadcastMessage("catalog:items", toJS(this.catalog.items, { recurseEverything: true }));
    });

    disposers.push(() => unsubscribeFromBroadcast("catalog:broadcast", listener));

    return disposers;
  }
}
