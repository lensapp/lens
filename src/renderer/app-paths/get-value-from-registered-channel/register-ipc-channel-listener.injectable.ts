/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "./ipc-renderer/ipc-renderer.injectable";
import type {
  IpcChannelListener,
} from "../../ipc-channel-listeners/ipc-channel-listener-injection-token";

const registerIpcChannelListenerInjectable = getInjectable({
  id: "register-ipc-channel-listener",

  instantiate: (di) => {
    const ipc = di.inject(ipcRendererInjectable);

    return ({ channel, handle }: IpcChannelListener) => {
      ipc.on(channel.name, (_, data) => {
        handle(data);
      });
    };
  },
});

export default registerIpcChannelListenerInjectable;
