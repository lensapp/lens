/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelHandler } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { catalogEntityRunChannel } from "../common/channel";

export type EmitCatalogEntityRun = MessageChannelHandler<typeof catalogEntityRunChannel>;

const emitCatalogEntityRunInjectable = getInjectable({
  id: "emit-catalog-entity-run",
  instantiate: (di): EmitCatalogEntityRun => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (entityId) => sendMessageToChannel(catalogEntityRunChannel, entityId);
  },
});

export default emitCatalogEntityRunInjectable;
