/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { reaction } from "mobx";
import { broadcastMessage, ipcMainOn } from "../common/ipc";
import type { CatalogEntityRegistry } from "./catalog";
import "../common/catalog-entities/kubernetes-cluster";
import { disposer, toJS } from "../common/utils";
import { debounce } from "lodash";
import type { CatalogEntity } from "../common/catalog";
import { CatalogIpcEvents } from "../common/ipc/catalog";

const broadcaster = debounce((items: CatalogEntity[]) => {
  broadcastMessage(CatalogIpcEvents.ITEMS, items);
}, 1_000, { leading: true, trailing: true });

export function pushCatalogToRenderer(catalog: CatalogEntityRegistry) {
  return disposer(
    ipcMainOn(CatalogIpcEvents.INIT, () => broadcaster(toJS(catalog.items))),
    reaction(() => toJS(catalog.items), (items) => {
      broadcaster(items);
    }, {
      fireImmediately: true,
    }),
  );
}
