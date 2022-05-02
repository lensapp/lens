/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createBrowserWindowInjectable from "./create-browser-window.injectable";
import type {
  SendToViewArgs } from "./lens-window-injection-token";
import {
  lensWindowInjectionToken,
} from "./lens-window-injection-token";
import type { BrowserWindow } from "electron";
import sendToChannelInElectronBrowserWindowInjectable from "./send-to-channel-in-electron-browser-window.injectable";

const applicationWindowInjectable = getInjectable({
  id: "application-window",

  instantiate: (di) => {
    const createBrowserWindow = di.inject(createBrowserWindowInjectable);

    let browserWindow: BrowserWindow = null;

    const hideWindow = () => {
      browserWindow?.hide();
    };

    const sendToChannelInLensWindow = di.inject(
      sendToChannelInElectronBrowserWindowInjectable,
    );

    return {
      show: async () => {
        if (!browserWindow) {
          browserWindow = await createBrowserWindow("only-application-window");
        }

        browserWindow.show();
      },

      hide: hideWindow,

      close: () => {
        hideWindow();

        browserWindow = null;
      },

      send: async (args: SendToViewArgs) => {
        if (!browserWindow) {
          browserWindow = await createBrowserWindow("only-application-window");
        }

        return sendToChannelInLensWindow(browserWindow, args);
      },
    };
  },

  injectionToken: lensWindowInjectionToken,
});

export default applicationWindowInjectable;
