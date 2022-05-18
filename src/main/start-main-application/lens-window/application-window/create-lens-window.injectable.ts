/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SendToViewArgs } from "./lens-window-injection-token";
import createElectronWindowForInjectable from "./create-electron-window-for.injectable";

export interface LensWindow {
  show: () => void;
  close: () => void;
  send: (args: SendToViewArgs) => void;
}

interface LensWindowConfiguration {
  id: string;
  title: string;
  defaultHeight: number;
  defaultWidth: number;
  getContentUrl: () => string;
  resizable: boolean;
  windowFrameUtilitiesAreShown: boolean;
  centered: boolean;

  beforeOpen?: () => Promise<void>;
  onFocus?: () => void;
  onBlur?: () => void;
  onDomReady?: () => void;
}

const createLensWindowInjectable = getInjectable({
  id: "create-lens-window",

  instantiate:
    (di) =>
      (configuration: LensWindowConfiguration) => {
        let browserWindow: LensWindow | undefined;

        const createElectronWindow = di.inject(createElectronWindowForInjectable)(
          {
            id: configuration.id,
            title: configuration.title,
            defaultHeight: configuration.defaultHeight,
            defaultWidth: configuration.defaultWidth,
            getContentUrl: configuration.getContentUrl,
            resizable: configuration.resizable,
            windowFrameUtilitiesAreShown: configuration.windowFrameUtilitiesAreShown,
            centered: configuration.centered,
            onFocus: configuration.onFocus,
            onBlur: configuration.onBlur,
            onDomReady: configuration.onDomReady,
            beforeOpen: configuration.beforeOpen,

            onClose: () => {
              browserWindow = undefined;
            },
          },
        );

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
      },
});

export default createLensWindowInjectable;
