/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensWindow, SendToViewArgs } from "./lens-window-injection-token";
import type { ContentSource, ElectronWindowTitleBarStyle } from "./create-electron-window-for.injectable";
import createElectronWindowForInjectable from "./create-electron-window-for.injectable";

export interface ElectronWindow {
  show: () => void;
  close: () => void;
  send: (args: SendToViewArgs) => void;
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
    const createElectronWindowFor = di.inject(createElectronWindowForInjectable);

    return (configuration: LensWindowConfiguration): LensWindow => {
      let browserWindow: ElectronWindow | undefined;

      const createElectronWindow = createElectronWindowFor({
        ...configuration,
        onClose: () => browserWindow = undefined,
      });

      let windowIsOpening = false;

      return {
        id: configuration.id,

        get visible() {
          return !!browserWindow;
        },

        get opening() {
          return windowIsOpening;
        },

        show: async () => {
          if (!browserWindow) {
            windowIsOpening = true;
            browserWindow = await createElectronWindow();
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
