/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { bundledExtensionsLoadedChannel } from "../common/channels";
import extensionEventsInjectable from "./extension-events.injectable";

const bundledExtensionsLoadedListenerInjectable = getMessageChannelListenerInjectable({
  channel: bundledExtensionsLoadedChannel,
  id: "main",
  handler: (di) => {
    const extensionEvents = di.inject(extensionEventsInjectable);

    return () => extensionEvents.emit("bundled-loaded");
  },
});

export default bundledExtensionsLoadedListenerInjectable;
