/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IpcRenderer } from "electron";
import type { Channel } from "../../../common/ipc-channel/channel";

interface Dependencies {
  ipcRenderer: IpcRenderer;
}

export const getValueFromRegisteredChannel = ({ ipcRenderer }: Dependencies) =>
  <TChannel extends Channel<TInstance>, TInstance>(
    channel: TChannel,
  ): Promise<TChannel["_template"]> =>
    ipcRenderer.invoke(channel.name);
