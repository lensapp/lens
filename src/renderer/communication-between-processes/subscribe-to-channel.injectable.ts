/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { subscribeToChannelInjectionToken } from "../../common/communication-between-processes/subscribe-to-channel-injection-token";
import type { Channel } from "../../common/ipc-channel/channel";
import ipcRendererInjectable from "../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";

const subscribeToChannelInjectable = getInjectable({
  id: "subscribe-to-channel",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return <TChannel extends Channel<TMessage>, TMessage>(channel: TChannel, callback: (message: TChannel["_template"]) => void) => {
      ipcRenderer.on(channel.name, (nonUsedNativeEvent, message: unknown) => {
        const channelMessage = message as TChannel["_template"];

        return callback(channelMessage);
      });
    };
  },

  injectionToken: subscribeToChannelInjectionToken,
});

export default subscribeToChannelInjectable;
