/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import appNameInjectable from "../../../app-paths/app-name/app-name.injectable";
import applicationWindowStateInjectable from "./application-window-state.injectable";
import lensProxyPortNumberStateInjectable from "../../../lens-proxy-port-number-state.injectable";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";
import { BrowserWindow, ipcMain } from "electron";
import { delay, openBrowser } from "../../../../common/utils";
import { bundledExtensionsLoaded } from "../../../../common/ipc/extension-handling";
import electronAppInjectable from "../../../electron-app/electron-app.injectable";
import appEventBusInjectable from "../../../../common/app-event-bus/app-event-bus.injectable";

const createBrowserWindowInjectable = getInjectable({
  id: "create-browser-window",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const applicationName = di.inject(appNameInjectable);
    const isMac = di.inject(isMacInjectable);
    const appEventBus = di.inject(appEventBusInjectable);

    const lensProxyPortNumberState = di.inject(
      lensProxyPortNumberStateInjectable,
    );

    return async (id: string) => {
      const applicationWindowState = di.inject(applicationWindowStateInjectable);
      const app = di.inject(electronAppInjectable);

      const { width, height, x, y } = applicationWindowState;

      const browserWindow = new BrowserWindow({
        x,
        y,
        width,
        height,
        title: applicationName,
        show: false,
        minWidth: 700, // accommodate 800 x 600 display minimum
        minHeight: 500, // accommodate 800 x 600 display minimum
        titleBarStyle: isMac ? "hiddenInset" : "hidden",
        frame: isMac,
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

      // open external links in default browser (target=_blank, window.open)
      browserWindow
        .on("focus", () => {
          appEventBus.emit({ name: "app", action: "focus" });
        })

        .on("blur", () => {
          appEventBus.emit({ name: "app", action: "blur" });
        })

        .on("closed", () => {
          // clean up
          applicationWindowState.unmanage();
          // this.mainWindow = null;
          // this.splashWindow = null;
          app.dock?.hide(); // hide icon in dock (mac-os)
        })

        .webContents.on("dom-ready", () => {
          appEventBus.emit({ name: "app", action: "dom-ready" });
        })

        .on("did-fail-load", (_event, code, desc) => {
          logger.error(`[WINDOW-MANAGER]: Failed to load Main window`, {
            code,
            desc,
          });
        })

        .on("did-finish-load", () => {
          logger.info("[WINDOW-MANAGER]: Main window loaded");
        })

        .on("will-attach-webview", (event, webPreferences, params) => {
          logger.debug("[WINDOW-MANAGER]: Attaching webview");
          // Following is security recommendations because we allow webview tag (webviewTag: true)
          // suggested by https://www.electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
          // and https://www.electronjs.org/docs/tutorial/security#10-do-not-use-allowpopups

          if (webPreferences.preload) {
            logger.warn(
              "[WINDOW-MANAGER]: Strip away preload scripts of webview",
            );
            delete webPreferences.preload;
          }

          // @ts-expect-error some electron version uses webPreferences.preloadURL/webPreferences.preload
          if (webPreferences.preloadURL) {
            logger.warn(
              "[WINDOW-MANAGER]: Strip away preload scripts of webview",
            );
            delete webPreferences.preload;
          }

          if (params.allowpopups) {
            logger.warn(
              "[WINDOW-MANAGER]: We do not allow allowpopups props, stop webview from renderer",
            );

            // event.preventDefault() will destroy the guest page.
            event.preventDefault();

            return;
          }

          // Always disable Node.js integration for all webviews
          webPreferences.nodeIntegration = false;
        })

        .setWindowOpenHandler((details) => {
          openBrowser(details.url).catch((error) => {
            logger.error("[WINDOW-MANAGER]: failed to open browser", { error });
          });

          return { action: "deny" };
        });

      const contentUrl = `http://localhost:${lensProxyPortNumberState.get()}`;

      logger.info(
        `[WINDOW-MANAGER]: Loading Main window from url: ${contentUrl} ...`,
      );

      await browserWindow.loadURL(contentUrl);

      const viewHasLoaded = new Promise<void>((resolve) => {
        ipcMain.once(bundledExtensionsLoaded, () => resolve());
      });

      await viewHasLoaded;
      await delay(50); // wait just a bit longer to let the first round of rendering happen

      return browserWindow;
    };
  },

  causesSideEffects: true,
});

export default createBrowserWindowInjectable;
