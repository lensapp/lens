/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SendToViewArgs } from "./lens-window-injection-token";
import type { ContentSource, ElectronWindowTitleBarStyle } from "./create-electron-window-for.injectable";
import createElectronWindowForInjectable from "./create-electron-window-for.injectable";

export interface LensWindow {
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

    return (configuration: LensWindowConfiguration) => {
      let browserWindow: LensWindow | undefined;

      const createElectronWindow = createElectronWindowFor({
        ...configuration,
        onClose: () => browserWindow = undefined,
      });

      return {
        get visible() {
          return !!browserWindow;
        },
        show: async () => {
          if (!browserWindow) {
            browserWindow = await createElectronWindow();
          }

          browserWindow.show();
        },
        close: () => {
          browserWindow?.close();
          browserWindow = undefined;
        },
        send: async (args: SendToViewArgs) => {
          if (!browserWindow) {
            browserWindow = await createElectronWindow();
          }

          return browserWindow.send(args);
        },
      };
    };
  },
});

export default createLensWindowInjectable;
