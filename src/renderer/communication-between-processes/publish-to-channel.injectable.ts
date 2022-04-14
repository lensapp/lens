/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { publishToChannelInjectionToken } from "../../common/communication-between-processes/publish-to-channel-injection-token";
import ipcRendererInjectable from "../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";

const publishToChannelInjectable = getInjectable({
  id: "publish-to-channel",

  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channel, message) => {
      ipcRenderer.send(channel.name, message);
    };
  },

  injectionToken: publishToChannelInjectionToken,
});

export default publishToChannelInjectable;
