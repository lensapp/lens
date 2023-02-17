/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import { requestCatalogEntityRegistryStateToBeSentChannel } from "../common/channel";
import startListeningOfChannelsInjectable from "../../../../renderer/utils/channel/channel-listeners/start-listening-of-channels.injectable";

const requestCatalogEntityRegistryStateToBeSentInjectable = getInjectable({
  id: "request-catalog-entity-registry-state-to-be-sent",
  instantiate: (di) => ({
    id: "request-catalog-entity-registry-state-to-be-sent",
    run: () => {
      const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

      sendMessageToChannel(requestCatalogEntityRegistryStateToBeSentChannel);
    },
    runAfter: di.inject(startListeningOfChannelsInjectable),
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default requestCatalogEntityRegistryStateToBeSentInjectable;
