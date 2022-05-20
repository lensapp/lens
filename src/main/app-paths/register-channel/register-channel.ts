/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IpcMain } from "electron";
import type { Channel } from "../../../common/channel/channel-injection-token";

interface Dependencies {
  ipcMain: IpcMain;
}

export const registerChannel =
  ({ ipcMain }: Dependencies) =>
  <TChannel extends Channel<unknown, unknown>>(
      channel: TChannel,
      getValue: () => TChannel["_messageTemplate"],
    ) =>
      ipcMain.handle(channel.id, getValue);
