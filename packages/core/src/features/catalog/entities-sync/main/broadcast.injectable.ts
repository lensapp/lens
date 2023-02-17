/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { debounce } from "lodash";
import type { MessageChannelSender } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { currentCatalogEntityRegistryStateChannel } from "../common/channel";

export type BroadcastCurrentCatalogEntityRegistryState = MessageChannelSender<typeof currentCatalogEntityRegistryStateChannel>;

const broadcastCurrentCatalogEntityRegistryStateInjectable = getInjectable({
  id: "broadcast-current-catalog-entity-registry-state",
  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);
    const handler: BroadcastCurrentCatalogEntityRegistryState = (items) => sendMessageToChannel(currentCatalogEntityRegistryStateChannel, items);

    return debounce(
      handler,
      100,
      {
        leading: true,
        trailing: true,
      },
    );
  },
});

export default broadcastCurrentCatalogEntityRegistryStateInjectable;
