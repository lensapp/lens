/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ChannelRequester } from "../../../../main/utils/channel/channel-listeners/listener-tokens";
import requestFromChannelInjectable from "../../../../renderer/utils/channel/request-from-channel.injectable";
import { catalogInitialEntitiesChannel } from "../common/sync-channels";

export type RequestInitialCatalogEntities = ChannelRequester<typeof catalogInitialEntitiesChannel>;

const requestInitialCatalogEntitiesInjectable = getInjectable({
  id: "request-initial-catalog-entities",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return () => requestFromChannel(catalogInitialEntitiesChannel);
  },
});

export default requestInitialCatalogEntitiesInjectable;
