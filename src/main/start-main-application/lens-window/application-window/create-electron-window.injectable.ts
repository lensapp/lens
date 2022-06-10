/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import applicationWindowStateInjectable from "./application-window-state.injectable";
import { BrowserWindow } from "electron";
import { openBrowser } from "../../../../common/utils";
import sendToChannelInElectronBrowserWindowInjectable from "./send-to-channel-in-electron-browser-window.injectable";
import type { ElectronWindow } from "./create-lens-window.injectable";
import type { RequireExactlyOne } from "type-fest";

export type ElectronWindowTitleBarStyle = "hiddenInset" | "hidden" | "default" | "customButtonsOnHover";

export interface FileSource {
  file: string;
}
export interface UrlSource {
  url: string;
}
export type ContentSource = RequireExactlyOne<FileSource & UrlSource>;

export interface ElectronWindowConfiguration {
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
  onClose: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onDomReady?: () => void;
}

export type CreateElectronWindow = (config: ElectronWindowConfiguration) => ElectronWindow;

const createElectronWindowInjectable = getInjectable({
  id: "create-electron-window",

  instantiate: (di): CreateElectronWindow => {
    const logger = di.inject(loggerInjectable);
    const sendToChannelInLensWindow = di.inject(sendToChannelInElectronBrowserWindowInjectable);

    return (configuration) => {
      const applicationWindowState = di.inject(
        applicationWindowStateInjectable,
        {
          id: configuration.id,
          defaultHeight: configuration.defaultHeight,
          defaultWidth: configuration.defaultWidth,
        },
      );

      const { width, height, x, y } = applicationWindowState;

      const browserWindow = new BrowserWindow({
        x,
        y,
        width,
        height,
        title: configuration.title,
        resizable: configuration.resizable,
        center: configuration.centered,
        frame: configuration.windowFrameUtilitiesAreShown,
        show: false,
        minWidth: 700, // accommodate 800 x 600 display minimum
        minHeight: 500, // accommodate 800 x 600 display minimum
        titleBarStyle: configuration.titleBarStyle,
        backgroundColor: "#1e2124",
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInSubFrames: true,
          webviewTag: true,
          contextIsolation: false,
          nativeWindowOpen: false,
        },
      });

      applicationWindowState.manage(browserWindow);

      browserWindow
        .on("focus", () => {
          configuration.onFocus?.();
        })

        .on("blur", () => {
          configuration.onBlur?.();
        })

        .on("closed", () => {
          configuration.onClose();
          applicationWindowState.unmanage();
        })

        .webContents.on("dom-ready", () => {
          configuration.onDomReady?.();
        })

        .on("did-fail-load", (_event, code, desc) => {
          logger.error(
            `[CREATE-ELECTRON-WINDOW]: Failed to load window "${configuration.id}"`,
            {
              code,
              desc,
            },
          );
        })

        .on("did-finish-load", () => {
          logger.info(
            `[CREATE-ELECTRON-WINDOW]: Window "${configuration.id}" loaded`,
          );
        })

        .on("will-attach-webview", (event, webPreferences, params) => {
          logger.debug(
            `[CREATE-ELECTRON-WINDOW]: Attaching webview to window "${configuration.id}"`,
          );
          // Following is security recommendations because we allow webview tag (webviewTag: true)
          // suggested by https://www.electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
          // and https://www.electronjs.org/docs/tutorial/security#10-do-not-use-allowpopups

          if (webPreferences.preload) {
            logger.warn(
              "[CREATE-ELECTRON-WINDOW]: Strip away preload scripts of webview",
            );
            delete webPreferences.preload;
          }

          // @ts-expect-error some electron version uses webPreferences.preloadURL/webPreferences.preload
          if (webPreferences.preloadURL) {
            logger.warn(
              "[CREATE-ELECTRON-WINDOW]: Strip away preload scripts of webview",
            );
            delete webPreferences.preload;
          }

          if (params.allowpopups) {
            logger.warn(
              "[CREATE-ELECTRON-WINDOW]: We do not allow allowpopups props, stop webview from renderer",
            );

            // event.preventDefault() will destroy the guest page.
            event.preventDefault();

            return;
          }

          // Always disable Node.js integration for all webviews
          webPreferences.nodeIntegration = false;
          webPreferences.nativeWindowOpen = false;
        })

        .setWindowOpenHandler((details) => {
          openBrowser(details.url).catch((error) => {
            logger.error("[CREATE-ELECTRON-WINDOW]: failed to open browser", {
              error,
            });
          });

          return { action: "deny" };
        });

      return {
        loadFile: async (filePath) => {
          logger.info(
            `[CREATE-ELECTRON-WINDOW]: Loading content for window "${configuration.id}" from file: ${filePath}...`,
          );

          await browserWindow.loadFile(filePath);
        },

        loadUrl: async (url) => {
          logger.info(
            `[CREATE-ELECTRON-WINDOW]: Loading content for window "${configuration.id}" from url: ${url}...`,
          );

          await browserWindow.loadURL(url);
        },

        show: () => browserWindow.show(),
        close: () => browserWindow.close(),
        send: (args) => sendToChannelInLensWindow(browserWindow, args),
      };
    };
  },

  causesSideEffects: true,
});

export default createElectronWindowInjectable;
