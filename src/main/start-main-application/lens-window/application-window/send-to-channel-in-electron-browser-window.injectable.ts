/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { BrowserWindow } from "electron";
import type { SendToViewArgs } from "./create-lens-window.injectable";

const sendToChannelInElectronBrowserWindowInjectable = getInjectable({
  id: "send-to-channel-in-electron-browser-window",

  instantiate:
    () =>
      (
        windowId: string,
        browserWindow: BrowserWindow,
        { channel, frameInfo, data = [] }: SendToViewArgs,
      ) => {
        if (frameInfo) {
          browserWindow.webContents.sendToFrame(
            [frameInfo.processId, frameInfo.frameId],
            channel,
            ...data,
          );
        } else {
          browserWindow.webContents.send(channel, ...data);
        }
      },

  causesSideEffects: true,
});

export default sendToChannelInElectronBrowserWindowInjectable;
