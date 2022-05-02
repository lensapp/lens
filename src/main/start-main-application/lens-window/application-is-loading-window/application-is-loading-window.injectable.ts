/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { BrowserWindow } from "electron";
import type {
  SendToViewArgs,
} from "../application-window/lens-window-injection-token";
import {
  lensWindowInjectionToken,
} from "../application-window/lens-window-injection-token";

const applicationIsLoadingWindowInjectable = getInjectable({
  id: "application-is-loading-window",

  instantiate: () => {
    let loadingWindow: BrowserWindow;

    const hideWindow = () => {
      loadingWindow?.hide();
    };

    return {
      show: async () => {
        if (!loadingWindow) {
          loadingWindow = await createLoadingWindow();
        }

        loadingWindow.show();
      },

      hide: hideWindow,

      close: () => {
        hideWindow();

        loadingWindow = null;
      },

      send: async ({ channel, frameInfo, data = [] }: SendToViewArgs) => {
        if (!loadingWindow) {
          loadingWindow = await createLoadingWindow();
        }

        if (frameInfo) {
          loadingWindow.webContents.sendToFrame(
            [frameInfo.processId, frameInfo.frameId],
            channel,
            ...data,
          );

        } else {
          loadingWindow.webContents.send(channel, ...data);
        }
      },
    };
  },

  injectionToken: lensWindowInjectionToken,

  causesSideEffects: true,
});

export default applicationIsLoadingWindowInjectable;

const createLoadingWindow = async () => {
  const loadingWindow = new BrowserWindow({
    width: 500,
    height: 300,
    backgroundColor: "#1e2124",
    center: true,
    frame: false,
    resizable: false,
    show: false,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInSubFrames: true,
      nativeWindowOpen: true,
    },
  });

  await loadingWindow.loadURL("static://splash.html");

  return loadingWindow;
};
