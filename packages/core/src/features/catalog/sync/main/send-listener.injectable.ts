/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getRequestChannelListenerInjectable } from "../../../../main/utils/channel/channel-listeners/listener-tokens";
import { catalogInitialEntitiesChannel } from "../common/sync-channels";
import catalogEntityChangeSetInjectable from "./entity-change-set.injectable";

const catalogSendEntityUpdatesListenerInjectable = getRequestChannelListenerInjectable({
  channel: catalogInitialEntitiesChannel,
  handler: (di) => {
    const catalogEntityChangeSet = di.inject(catalogEntityChangeSetInjectable);

    return () => catalogEntityChangeSet.get();
  },
});

export default catalogSendEntityUpdatesListenerInjectable;
