/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { toJS } from "../../../../common/utils";
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import catalogEntityRegistryInjectable from "../../../../main/catalog/entity-registry.injectable";
import { requestCatalogEntityRegistryStateToBeSentChannel } from "../common/channel";
import broadcastCurrentCatalogEntityRegistryStateInjectable from "./broadcast.injectable";

const requestForCurrentCatalogEntityStateToBeSentListenerInjectable = getMessageChannelListenerInjectable({
  id: "main",
  channel: requestCatalogEntityRegistryStateToBeSentChannel,
  handler: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const broadcastCurrentCatalogEntityRegistryState = di.inject(broadcastCurrentCatalogEntityRegistryStateInjectable);

    return () => broadcastCurrentCatalogEntityRegistryState(toJS(catalogEntityRegistry.items));
  },
});

export default requestForCurrentCatalogEntityStateToBeSentListenerInjectable;
