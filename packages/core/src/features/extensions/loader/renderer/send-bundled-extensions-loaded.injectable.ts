/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { bundledExtensionsLoadedChannel } from "../common/channels";

const sendBundledExtensionsLoadedInjectable = getInjectable({
  id: "send-bundled-extensions-loaded",
  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return () => sendMessageToChannel(bundledExtensionsLoadedChannel);
  },
});

export default sendBundledExtensionsLoadedInjectable;
