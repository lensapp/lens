/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../common/cluster-types";
import { computed, IComputedValue, makeObservable, observable } from "mobx";
import { app, BrowserWindow, dialog, ipcMain, shell, webContents } from "electron";
import windowStateKeeper from "electron-window-state";
import { appEventBus } from "../../common/app-event-bus/event-bus";
import { BundledExtensionsLoaded, ipcMainOn } from "../../common/ipc";
import { delay, iter } from "../../common/utils";
import { ClusterFrameInfo, clusterFrameMap } from "../../common/cluster-frames";
import { IpcRendererNavigationEvents } from "../../renderer/navigation/events";
import logger from "../logger";
import { isMac, productName } from "../../common/vars";

export const enum IpcMainWindowEvents {
  OPEN_CONTEXT_MENU = "window:open-context-menu",
}

function isHideable(window: BrowserWindow | null): boolean {
  return Boolean(window && !window.isDestroyed());
}

export interface SendToViewArgs {
  channel: string;
  frameInfo?: ClusterFrameInfo;
  data?: any[];
}

export interface WindowManagerDependencies {
  readonly proxyPort: IComputedValue<number>;
}

export class WindowManager {
  protected mainWindow: BrowserWindow;
  protected splashWindow: BrowserWindow;
  protected windowState: windowStateKeeper.State;
  protected disposers: Record<string, Function> = {};

  @observable activeClusterId: ClusterId;

  constructor(protected readonly dependencies: WindowManagerDependencies) {
    makeObservable(this);
    this.bindEvents();
  }

  @computed get mainUrl() {
    return `http://localhost:${this.dependencies.proxyPort.get()}`;
  }

  private async initMainWindow(showSplash: boolean) {
    // Manage main window size and position with state persistence
    if (!this.windowState) {
      this.windowState = windowStateKeeper({
        defaultHeight: 900,
        defaultWidth: 1440,
      });
    }

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
          enableRemoteModule: true,
          webviewTag: true,
          contextIsolation: false,
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
          this.windowState.unmanage();
          this.mainWindow = null;
          this.splashWindow = null;
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
        }).setWindowOpenHandler((details) => {
          shell.openExternal(details.url);

          return { action: "deny" };
        });
    }

    try {
      if (showSplash) await this.showSplash();
      logger.info(`[WINDOW-MANAGER]: Loading Main window from url: ${this.mainUrl} ...`);
      await this.mainWindow.loadURL(this.mainUrl);
    } catch (error) {
      logger.error("Loading main window failed", { error });
      dialog.showErrorBox("ERROR!", error.toString());
    }
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
        ipcMain.once(BundledExtensionsLoaded, () => resolve());
      });
      await this.initMainWindow(showSplash);
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
      logger.error(`Showing main window failed: ${error.stack || error}`);
      dialog.showErrorBox("ERROR!", error.toString());
    }

    return this.mainWindow;
  }

  private sendToView({ channel, frameInfo, data = [] }: SendToViewArgs) {
    if (frameInfo) {
      this.mainWindow.webContents.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...data);
    } else {
      this.mainWindow.webContents.send(channel, ...data);
    }
  }

  async navigateExtension(extId: string, pageId?: string, params?: Record<string, any>, frameId?: number) {
    await this.ensureMainWindow();

    const frameInfo = iter.find(clusterFrameMap.values(), frameInfo => frameInfo.frameId === frameId);

    this.sendToView({
      channel: "extension:navigate",
      frameInfo,
      data: [extId, pageId, params],
    });
  }

  async navigate(url: string, frameId?: number) {
    await this.ensureMainWindow();

    const frameInfo = iter.find(clusterFrameMap.values(), frameInfo => frameInfo.frameId === frameId);
    const channel = frameInfo
      ? IpcRendererNavigationEvents.NAVIGATE_IN_CLUSTER
      : IpcRendererNavigationEvents.NAVIGATE_IN_APP;

    this.sendToView({
      channel,
      frameInfo,
      data: [url],
    });
  }

  reload() {
    const frameInfo = clusterFrameMap.get(this.activeClusterId);

    if (frameInfo) {
      this.sendToView({ channel: IpcRendererNavigationEvents.RELOAD_PAGE, frameInfo });
    } else {
      webContents.getAllWebContents().filter(wc => wc.getType() === "window").forEach(wc => {
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
          enableRemoteModule: true,
          contextIsolation: false,
          nodeIntegrationInSubFrames: true,
        },
      });
      await this.splashWindow.loadURL("static://splash.html");
    }
    this.splashWindow.show();
  }

  hide() {
    if (isHideable(this.mainWindow)) {
      this.mainWindow.hide();
    }

    if (isHideable(this.splashWindow)) {
      this.splashWindow.hide();
    }
  }

  destroy() {
    this.mainWindow.destroy();
    this.splashWindow.destroy();
    this.mainWindow = null;
    this.splashWindow = null;
    Object.entries(this.disposers).forEach(([name, dispose]) => {
      dispose();
      delete this.disposers[name];
    });
  }
}
