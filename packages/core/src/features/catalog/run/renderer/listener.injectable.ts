/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { noop } from "../../../../common/utils";
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import catalogEntityRegistryInjectable from "../../../../renderer/api/catalog/entity/registry.injectable";
import currentlyInClusterFrameInjectable from "../../../../renderer/routes/currently-in-cluster-frame.injectable";
import { catalogEntityRunChannel } from "../common/channel";

const catalogEntityRunListener = getMessageChannelListenerInjectable({
  channel: catalogEntityRunChannel,
  id: "main",
  handler: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);

    if (currentlyInClusterFrame) {
      return noop;
    }

    return (entityId) => {
      const entity = catalogEntityRegistry.getById(entityId);

      if (entity) {
        catalogEntityRegistry.onRun(entity);
      }
    };
  },
});

export default catalogEntityRunListener;
