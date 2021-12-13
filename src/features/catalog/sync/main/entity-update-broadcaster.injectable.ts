/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { debounce } from "lodash";
import type { CatalogEntityData, CatalogEntityKindData } from "../../../../common/catalog";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { catalogEntityUpdatesChannel } from "../common/sync-channels";

const entityUpdateBroadcasterInjectable = getInjectable({
  id: "entity-update-broadcaster",
  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return debounce(
      (items: (CatalogEntityData & CatalogEntityKindData)[]) => sendMessageToChannel(catalogEntityUpdatesChannel, items),
      100,
      {
        leading: true,
        trailing: true,
      },
    );
  },
});

export default entityUpdateBroadcasterInjectable;
