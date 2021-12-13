/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import catalogEntityRegistryInjectable from "../../../../renderer/api/catalog/entity/registry.injectable";
import { catalogEntityUpdatesChannel } from "../common/sync-channels";

const catalogEntityUpdatesListener = getMessageChannelListenerInjectable({
  channel: catalogEntityUpdatesChannel,
  id: "main",
  handler: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return (items) => {
      catalogEntityRegistry.updateItems(items);
    };
  },
});

export default catalogEntityUpdatesListener;
