/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { app, BrowserWindow, dialog, ipcMain, shell, webContents } from "electron";
import windowStateKeeper from "electron-window-state";
import { appEventBus } from "../common/event-bus";
import { delay, iter, Singleton } from "../common/utils";
import { ClusterFrameInfo, ClusterFrames } from "../common/cluster-frames";
import { IpcRendererNavigationEvents } from "../renderer/navigation/events";
import logger from "./logger";
import { productName } from "../common/vars";
import { LensProxy } from "./proxy/lens-proxy";
import { reaction } from "mobx";

function isHideable(window: BrowserWindow | null): boolean {
  return Boolean(window && !window.isDestroyed());
}

export interface SendToViewArgs {
  channel: string;
  frameInfo?: ClusterFrameInfo;
  data?: any[];
}

export interface NavigateFrameInfoSpecifier {
  windowId?: number;
  clusterId?: string;
  frameId?: number;
}

export class WindowManager extends Singleton {
  protected splashWindow: BrowserWindow;
  protected windows = new Map<number, [BrowserWindow, windowStateKeeper.State]>();

  constructor() {
    super();

    reaction(() => this.windows.size, windowCount => {
      // show icon in dock (mac-os only)
      if (windowCount) {
        app.dock?.show();
      } else {
        app.dock?.hide();
      }
    });
  }

  get mainUrl() {
    return `http://localhost:${LensProxy.getInstance().port}`;
  }

  private async createNewWindow(): Promise<BrowserWindow> {
    const windowState = windowStateKeeper({
      defaultHeight: 900,
      defaultWidth: 1440,
    });
    const { width, height, x, y } = windowState;
    const browserWindow = new BrowserWindow({
      x, y, width, height,
      title: productName,
      show: false,
      minWidth: 700,  // accommodate 800 x 600 display minimum
      minHeight: 500, // accommodate 800 x 600 display minimum
      titleBarStyle: "hidden",
      backgroundColor: "#1e2124",
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        enableRemoteModule: true,
      },
    });
    const windowId = browserWindow.webContents.getProcessId();

    windowState.manage(browserWindow);
    this.windows.set(windowId, [browserWindow, windowState]);

    browserWindow
      .on("focus", () => appEventBus.emit({ name: "app", action: "focus" }))
      .on("blur", () => appEventBus.emit({ name: "app", action: "blur" }))
      .on("closed", () => {
        // clean up
        windowState.unmanage();
        this.windows.delete(windowId);
        ClusterFrames.getInstance().clearInfoForWindow(windowId);

        this.splashWindow?.close();
        this.splashWindow = null;
      })
      .webContents
      .on("new-window", (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
      })
      .on("dom-ready", () => appEventBus.emit({ name: "app", action: "dom-ready" }))
      .on("did-fail-load", (_event, code, desc) => {
        logger.error(`[WINDOW-MANAGER]: Failed to load window`, { windowId, code, desc });
      })
      .on("did-finish-load", () => {
        logger.info("[WINDOW-MANAGER]: Window emitted did-finish-load", { windowId });
      });

    return browserWindow;
  }

  public async openNewWindow(): Promise<BrowserWindow> {
    const browserWindow = await this.createNewWindow();
    const windowId = browserWindow.webContents.getProcessId();

    try {
      await this.showSplash();

      logger.info(`[WINDOW-MANAGER]: Loading window from url: ${this.mainUrl} ...`, { windowId });

      const viewHasLoaded = new Promise<void>(resolve => {
        const listener = (event: Electron.IpcMainEvent): void => {
          if (event.sender.getProcessId() === browserWindow.webContents.getProcessId()) {
            resolve();
            ipcMain.off(IpcRendererNavigationEvents.LOADED, listener);
          }
        };

        ipcMain.on(IpcRendererNavigationEvents.LOADED, listener);
      });

      await browserWindow.loadURL(this.mainUrl);
      await viewHasLoaded;

      this.splashWindow?.close();
      this.splashWindow = undefined;
      browserWindow.show();

      setTimeout(() => {
        appEventBus.emit({ name: "app", action: "start" });
      }, 1000);
    } catch (error) {
      logger.error("Loading window failed", { windowId, error });
      dialog.showErrorBox("ERROR!", error.toString());
    }

    return browserWindow;
  }

  async ensureWindow(windowId?: number): Promise<BrowserWindow> {
    // This needs to be ready to hear the IPC message before the window is loaded
    let viewHasLoaded = Promise.resolve();
    let browserWindow: BrowserWindow;

    if (this.windows.size === 0) {
      viewHasLoaded = new Promise<void>(resolve => {
        ipcMain.once(IpcRendererNavigationEvents.LOADED, () => resolve());
      });

      browserWindow = await this.openNewWindow();

      try {
        await this.showSplash();
        logger.info(`[WINDOW-MANAGER]: Loading window from url: ${this.mainUrl} ...`, { windowId: browserWindow.webContents.getProcessId() });
        await browserWindow.loadURL(this.mainUrl);
      } catch (error) {
        logger.error("Loading window failed", { error });
        dialog.showErrorBox("ERROR!", error.toString());
      }
    } else if (typeof windowId === "number") {
      browserWindow = (this.windows.get(windowId) ?? iter.first(this.windows.values()))[0];
    }

    browserWindow ??= iter.first(this.windows.values())[0];

    try {
      await viewHasLoaded;
      await delay(50); // wait just a bit longer to let the first round of rendering happen
      logger.info("[WINDOW-MANAGER]: Window has reported that it has loaded", { windowId: browserWindow.webContents.getProcessId() });

      this.splashWindow?.close();
      this.splashWindow = undefined;
      browserWindow.show();
      setTimeout(() => {
        appEventBus.emit({ name: "app", action: "start" });
      }, 1000);
    } catch (error) {
      logger.error(`Showing window failed: ${error.stack || error}`);
      dialog.showErrorBox("ERROR!", error.toString());
    }

    return browserWindow;
  }

  public hasVisibleWindow(): boolean {
    for (const [window] of this.windows.values()) {
      if (window.isVisible()) {
        return true;
      }
    }

    return false;
  }

  private sendToView(browserWindow: BrowserWindow, { channel, frameInfo, data = [] }: SendToViewArgs) {
    if (frameInfo) {
      browserWindow.webContents.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...data);
    } else {
      browserWindow.webContents.send(channel, ...data);
    }
  }

  async navigateExtension(extId: string, pageId?: string, params?: Record<string, any>, frameId?: number) {
    const browserWindow = await this.ensureWindow();
    const frameInfo = ClusterFrames.getInstance().getFrameInfoByFrameId(frameId);

    this.sendToView(browserWindow, {
      channel: "extension:navigate",
      frameInfo,
      data: [extId, pageId, params],
    });
  }

  /**
   * Get the naviate target
   * @param specifics The fallback options for specifying a target
   */
  private getNavigateTarget(specifics: NavigateFrameInfoSpecifier[]): [ClusterFrameInfo | undefined, number | undefined] {
    function* helper(): Iterable<ClusterFrameInfo | number | undefined> {
      const clusterFrames = ClusterFrames.getInstance();

      for (const fallback of specifics) {
        if (typeof fallback.clusterId === "string") {
          yield clusterFrames.getFrameInfoByClusterId(fallback.clusterId);
          continue;
        }

        if (typeof fallback.frameId === "number") {
          yield clusterFrames.getFrameInfoByFrameId(fallback.frameId);
          continue;
        }

        if (typeof fallback.windowId === "number") {
          yield fallback.windowId;
        }
      }

      return undefined;
    }

    const target = iter.first(iter.keepDefined(helper()));

    if (typeof target === "number") {
      return [undefined, target];
    }

    if (target) {
      return [target, target.windowId];
    }

    return [undefined, undefined];
  }

  /**
   * Navigate to `url` on a specific window or frame
   * @param url The url to navigate to
   * @param specifics Data for specifying a specific window or iframe
   */
  async navigate(url: string, ...specifics: NavigateFrameInfoSpecifier[]): Promise<void> {
    const [frameInfo, windowId] = this.getNavigateTarget(specifics);
    const browserWindow = await this.ensureWindow(windowId);
    const channel = frameInfo
      ? IpcRendererNavigationEvents.NAVIGATE_IN_CLUSTER
      : IpcRendererNavigationEvents.NAVIGATE_IN_APP;
    const clusterId = frameInfo
      ? ClusterFrames.getInstance().getClusterIdFromFrameInfo(frameInfo)
      : undefined;

    if (clusterId && url.startsWith(`/cluster/${clusterId}`)) {
      this.sendToView(browserWindow, {
        channel: IpcRendererNavigationEvents.NAVIGATE_IN_APP,
        data: [url],
      });
    } else {
      this.sendToView(browserWindow, {
        channel,
        frameInfo,
        data: [url],
      });
    }
  }

  reload() {
    webContents.getFocusedWebContents()?.reload();
  }

  private async showSplash() {
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
          nodeIntegration: true
        }
      });
      await this.splashWindow.loadURL("static://splash.html");
    }
    this.splashWindow.show();
  }

  hide() {
    for (const [window] of this.windows.values()) {
      if (isHideable(window)) {
        window.hide();
      }
    }

    if (isHideable(this.splashWindow)) {
      this.splashWindow.hide();
    }
  }

  destroy() {
    for (const [window, manager] of this.windows.values()) {
      manager.unmanage();
      window.destroy();
    }

    this.windows.clear();
    this.splashWindow.destroy();
    this.splashWindow = null;
  }
}
