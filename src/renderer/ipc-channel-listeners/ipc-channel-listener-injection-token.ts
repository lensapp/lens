/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Channel } from "../../common/ipc-channel/channel";


export interface IpcChannelListener {
  channel: Channel<unknown>;
  handle: (value: any) => void;
}

export const ipcChannelListenerInjectionToken =
  getInjectionToken<IpcChannelListener>({
    id: "ipc-channel-listener-injection-token",
  });
