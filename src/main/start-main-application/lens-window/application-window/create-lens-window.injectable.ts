/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensWindow, SendToViewArgs } from "./lens-window-injection-token";
import type { ContentSource, ElectronWindowTitleBarStyle } from "./create-electron-window.injectable";
import createElectronWindowForInjectable from "./create-electron-window.injectable";
import assert from "assert";

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

      let windowIsShown = false;
      let windowIsStarting = false;

      const showWindow = () => {
        assert(browserWindow);

        browserWindow.show();
        windowIsShown = true;
      };

      return {
        id: configuration.id,

        get isVisible() {
          return windowIsShown;
        },

        get isStarting() {
          return windowIsStarting;
        },

        start: async () => {
          if (!browserWindow) {
            windowIsStarting = true;

            browserWindow = createElectronWindow({
              ...configuration,
              onClose: () => {
                browserWindow = undefined;
                windowIsShown = false;
              },
            });

            const { file: filePathForContent, url: urlForContent } =
              configuration.getContentSource();

            if (filePathForContent) {
              await browserWindow.loadFile(filePathForContent);
            } else if (urlForContent) {
              await browserWindow.loadUrl(urlForContent);
            }

            await configuration.beforeOpen?.();
          }

          showWindow();

          windowIsStarting = false;
        },

        show: showWindow,

        close: () => {
          browserWindow?.close();
          browserWindow = undefined;
          windowIsShown = false;
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
