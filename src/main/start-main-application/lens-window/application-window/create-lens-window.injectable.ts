/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensWindow, SendToViewArgs } from "./lens-window-injection-token";
import type { ContentSource, ElectronWindowTitleBarStyle } from "./create-electron-window.injectable";
import createElectronWindowForInjectable from "./create-electron-window.injectable";

export interface ElectronWindow {
  show: () => void;
  close: () => void;
  send: (args: SendToViewArgs) => void;
  loadFile: (filePath: string) => Promise<void>;
  loadUrl: (url: string) => Promise<void>;
}

export interface LensWindowConfiguration {
  id: string;
  title: string;
  defaultHeight: number;
  defaultWidth: number;
  getContentSource: () => ContentSource;
  resizable: boolean;
  windowFrameUtilitiesAreShown: boolean;
  centered: boolean;
  titleBarStyle?: ElectronWindowTitleBarStyle;
  beforeOpen?: () => Promise<void>;
  onFocus?: () => void;
  onBlur?: () => void;
  onDomReady?: () => void;
}

const createLensWindowInjectable = getInjectable({
  id: "create-lens-window",

  instantiate: (di) => {
    const createElectronWindow = di.inject(createElectronWindowForInjectable);

    return (configuration: LensWindowConfiguration): LensWindow => {
      let browserWindow: ElectronWindow | undefined;

      let windowIsOpening = false;
      let contentIsLoading = false;

      return {
        id: configuration.id,

        get visible() {
          return !!browserWindow && !contentIsLoading;
        },

        get opening() {
          return windowIsOpening;
        },

        show: async () => {
          if (!browserWindow) {
            windowIsOpening = true;

            browserWindow = createElectronWindow({
              ...configuration,
              onClose: () => browserWindow = undefined,
            });

            const windowFilePath = configuration.getContentSource().file;
            const windowUrl = configuration.getContentSource().url;

            contentIsLoading = true;

            if (windowFilePath) {
              await browserWindow.loadFile(windowFilePath);
            } else if (windowUrl) {
              await browserWindow.loadUrl(windowUrl);
            }

            await configuration.beforeOpen?.();

            contentIsLoading = false;
          }

          browserWindow.show();
          windowIsOpening = false;
        },

        close: () => {
          browserWindow?.close();
          browserWindow = undefined;
        },

        send: (args: SendToViewArgs) => {
          if (!browserWindow) {
            throw new Error(`Tried to send message to window "${configuration.id}" but the window was closed`);
          }

          return browserWindow.send(args);
        },
      };
    };
  },
});

export default createLensWindowInjectable;
