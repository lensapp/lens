/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../common/cluster-types";
import { makeObservable, observable } from "mobx";
import { app, BrowserWindow, dialog, ipcMain, webContents } from "electron";
import windowStateKeeper from "electron-window-state";
import { appEventBus } from "../common/app-event-bus/event-bus";
import { ipcMainOn } from "../common/ipc";
import { delay, iter, Singleton, openBrowser } from "../common/utils";
import type { ClusterFrameInfo } from "../common/cluster-frames";
import { clusterFrameMap } from "../common/cluster-frames";
import { IpcRendererNavigationEvents } from "../renderer/navigation/events";
import logger from "./logger";
import { isMac, productName } from "../common/vars";
import { LensProxy } from "./lens-proxy";
import { bundledExtensionsLoaded } from "../common/ipc/extension-handling";

export interface SendToViewArgs {
  channel: string;
  frameInfo?: ClusterFrameInfo;
  data?: any[];
}

export class WindowManager extends Singleton {
  public mainContentUrl = `http://localhost:${LensProxy.getInstance().port}`;

  protected mainWindow?: BrowserWindow;
  protected splashWindow?: BrowserWindow;
  protected windowState?: windowStateKeeper.State;

  @observable activeClusterId?: ClusterId;

  constructor() {
    super();
    makeObservable(this);
    this.bindEvents();
  }

  private async initMainWindow(showSplash: boolean): Promise<BrowserWindow> {
    // Manage main window size and position with state persistence
    this.windowState ??= windowStateKeeper({
      defaultHeight: 900,
      defaultWidth: 1440,
    });

    if (!this.mainWindow) {
      // show icon in dock (mac-os only)
      app.dock?.show();

      const { width, height, x, y } = this.windowState;

      this.mainWindow = new BrowserWindow({
        x, y, width, height,
        title: productName,
        show: false,
        minWidth: 700,  // accommodate 800 x 600 display minimum
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
      this.windowState.manage(this.mainWindow);

      // open external links in default browser (target=_blank, window.open)
      this.mainWindow
        .on("focus", () => {
          appEventBus.emit({ name: "app", action: "focus" });
        })
        .on("blur", () => {
          appEventBus.emit({ name: "app", action: "blur" });
        })
        .on("closed", () => {
          // clean up
          this.windowState?.unmanage();
          this.mainWindow = undefined;
          this.splashWindow = undefined;
          app.dock?.hide(); // hide icon in dock (mac-os)
        })
        .webContents
        .on("dom-ready", () => {
          appEventBus.emit({ name: "app", action: "dom-ready" });
        })
        .on("did-fail-load", (_event, code, desc) => {
          logger.error(`[WINDOW-MANAGER]: Failed to load Main window`, { code, desc });
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
            logger.warn("[WINDOW-MANAGER]: Strip away preload scripts of webview");
            delete webPreferences.preload;
          }

          // @ts-expect-error some electron version uses webPreferences.preloadURL/webPreferences.preload
          if (webPreferences.preloadURL) {
            logger.warn("[WINDOW-MANAGER]: Strip away preload scripts of webview");
            delete webPreferences.preload;
          }

          if (params.allowpopups) {
            logger.warn("[WINDOW-MANAGER]: We do not allow allowpopups props, stop webview from renderer");

            // event.preventDefault() will destroy the guest page.
            event.preventDefault();

            return;
          }

          // Always disable Node.js integration for all webviews
          webPreferences.nodeIntegration = false;
        })
        .setWindowOpenHandler((details) => {
          openBrowser(details.url).catch(error => {
            logger.error("[WINDOW-MANAGER]: failed to open browser", { error });
          });

          return { action: "deny" };
        });
    }

    try {
      if (showSplash) {
        await this.showSplash();
      }
      logger.info(`[WINDOW-MANAGER]: Loading Main window from url: ${this.mainContentUrl} ...`);
      await this.mainWindow.loadURL(this.mainContentUrl);
    } catch (error) {
      logger.error("Loading main window failed", { error });
      dialog.showErrorBox("ERROR!", String(error));
    }

    return this.mainWindow;
  }

  protected bindEvents() {
    // track visible cluster from ui
    ipcMainOn(IpcRendererNavigationEvents.CLUSTER_VIEW_CURRENT_ID, (event, clusterId: ClusterId) => {
      this.activeClusterId = clusterId;
    });
  }

  async ensureMainWindow(showSplash = true): Promise<BrowserWindow> {
    // This needs to be ready to hear the IPC message before the window is loaded
    let viewHasLoaded = Promise.resolve();

    if (!this.mainWindow) {
      viewHasLoaded = new Promise<void>(resolve => {
        ipcMain.once(bundledExtensionsLoaded, () => resolve());
      });
      this.mainWindow = await this.initMainWindow(showSplash);
    }

    try {
      await viewHasLoaded;
      await delay(50); // wait just a bit longer to let the first round of rendering happen
      logger.info("[WINDOW-MANAGER]: Main window has reported that it has loaded");

      this.mainWindow.show();
      this.splashWindow?.close();
      this.splashWindow = undefined;
      setTimeout(() => {
        appEventBus.emit({ name: "app", action: "start" });
      }, 1000);
    } catch (error) {
      logger.error(`Showing main window failed`, error);
      dialog.showErrorBox("ERROR!", String(error));
    }

    return this.mainWindow;
  }

  private sendToView(window: BrowserWindow, { channel, frameInfo, data = [] }: SendToViewArgs) {
    if (frameInfo) {
      window.webContents.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...data);
    } else {
      window.webContents.send(channel, ...data);
    }
  }

  async navigateExtension(extId: string, pageId?: string, params?: Record<string, any>, frameId?: number) {
    const window = await this.ensureMainWindow();
    const frameInfo = iter.find(clusterFrameMap.values(), frameInfo => frameInfo.frameId === frameId);

    this.sendToView(window, {
      channel: "extension:navigate",
      frameInfo,
      data: [extId, pageId, params],
    });
  }

  async navigate(url: string, frameId?: number) {
    const window = await this.ensureMainWindow();

    this.navigateSync(window, url, frameId);
  }

  navigateSync(window: BrowserWindow, url: string, frameId?: number) {
    const frameInfo = iter.find(clusterFrameMap.values(), frameInfo => frameInfo.frameId === frameId);
    const channel = frameInfo
      ? IpcRendererNavigationEvents.NAVIGATE_IN_CLUSTER
      : IpcRendererNavigationEvents.NAVIGATE_IN_APP;

    this.sendToView(window, {
      channel,
      frameInfo,
      data: [url],
    });
  }

  private getActiveClusterFrameInfo() {
    if (this.activeClusterId) {
      return clusterFrameMap.get(this.activeClusterId);
    }

    return undefined;
  }

  reload() {
    const frameInfo = this.getActiveClusterFrameInfo();

    if (frameInfo && this.mainWindow) {
      this.sendToView(this.mainWindow, { channel: IpcRendererNavigationEvents.RELOAD_PAGE, frameInfo });
    } else {
      webContents.getAllWebContents()
        .filter(wc => wc.getType() === "window")
        .forEach(wc => {
          wc.reload();
          wc.clearHistory();
        });
    }
  }

  async showSplash() {
    if (!this.splashWindow) {
      this.splashWindow = new BrowserWindow({
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
      await this.splashWindow.loadURL("static://splash.html");
    }
    this.splashWindow.show();
  }

  hide() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.hide();
    }

    if (this.splashWindow && !this.splashWindow.isDestroyed()) {
      this.splashWindow.hide();
    }
  }

  destroy() {
    this.mainWindow?.destroy();
    this.splashWindow?.destroy();
    this.mainWindow = undefined;
    this.splashWindow = undefined;
  }
}
