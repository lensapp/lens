/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ContentSource, ElectronWindow, ElectronWindowTitleBarStyle, SendToViewArgs } from "./create-electron-window.injectable";
import createElectronWindowForInjectable from "./create-electron-window.injectable";

export interface LensWindow {
  id: string;
  start: () => Promise<void>;
  close: () => void;
  show: () => void;
  send: (args: SendToViewArgs) => void;
  isVisible: boolean;
  isStarting: boolean;
  reload: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
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

  /**
   * This function is called before the ContentSource is used and then awaited after
   * the open call resolves
   */
  beforeOpen?: () => Promise<void>;
  onFocus?: () => void;
  onBlur?: () => void;
  onDomReady?: () => void;
  onClose?: () => void;
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
        if (!browserWindow) {
          throw new Error("Cannot show browserWindow, does not exist");
        }

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
        canGoBack: () => Boolean(browserWindow?.canGoBack()),
        canGoForward: () => Boolean(browserWindow?.canGoForward()),
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

            const {
              file: filePathForContent,
              url: urlForContent,
            } = configuration.getContentSource();

            const beforeOpen = configuration.beforeOpen?.();

            if (filePathForContent) {
              await browserWindow.loadFile(filePathForContent);
            } else if (urlForContent) {
              await browserWindow.loadUrl(urlForContent);
            }

            await beforeOpen;
          }

          showWindow();

          windowIsStarting = false;
        },

        show: showWindow,

        close: () => {
          browserWindow?.close();
          browserWindow = undefined;
          windowIsShown = false;
          configuration.onClose?.();
        },

        send: (args: SendToViewArgs) => {
          if (!browserWindow) {
            throw new Error(`Tried to send message to window "${configuration.id}" but the window was closed`);
          }

          return browserWindow.send(args);
        },

        reload: () => {
          if (!browserWindow) {
            throw new Error(`Tried to reload window "${configuration.id}" but the window was closed`);
          }

          return browserWindow.reload();
        },
      };
    };
  },
});

export default createLensWindowInjectable;
