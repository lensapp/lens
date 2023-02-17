/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { runCatalogEntityChannel } from "../common/channels";

export type RequestCatalogEntityRun = (id: string) => void;

const requestCatalogEntityRunInjectable = getInjectable({
  id: "request-catalog-entity-run",
  instantiate: (di): RequestCatalogEntityRun => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (id) => sendMessageToChannel(runCatalogEntityChannel, id);
  },
});

export default requestCatalogEntityRunInjectable;
