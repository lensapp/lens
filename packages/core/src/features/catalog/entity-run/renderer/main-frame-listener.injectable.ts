/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { noop } from "../../../../common/utils";
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import catalogEntityRegistryInjectable from "../../../../renderer/api/catalog/entity/registry.injectable";
import currentlyInClusterFrameInjectable from "../../../../renderer/routes/currently-in-cluster-frame.injectable";
import { runCatalogEntityMainFrameChannel } from "../common/channels";

const entityRunMainFrameListenerInjectable = getMessageChannelListenerInjectable({
  channel: runCatalogEntityMainFrameChannel,
  id: "main",
  handler: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);

    if (currentlyInClusterFrame) {
      return noop;
    }

    return (id) => catalogEntityRegistry.onRunById(id);
  },
});

export default entityRunMainFrameListenerInjectable;
