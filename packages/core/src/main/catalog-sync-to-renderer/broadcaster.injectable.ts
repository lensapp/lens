/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { debounce } from "lodash";
import type { CatalogEntity } from "../../common/catalog";
import broadcastMessageInjectable from "../../common/ipc/broadcast-message.injectable";
import { catalogItemsChannel } from "../../common/ipc/catalog";

const catalogSyncBroadcasterInjectable = getInjectable({
  id: "catalog-sync-broadcaster",
  instantiate: (di) => {
    const broadcastMessage = di.inject(broadcastMessageInjectable);

    return debounce(
      (items: CatalogEntity[]) => {
        broadcastMessage(catalogItemsChannel, items);
      },
      100,
      {
        leading: true,
        trailing: true,
      },
    );
  },
});

export default catalogSyncBroadcasterInjectable;
