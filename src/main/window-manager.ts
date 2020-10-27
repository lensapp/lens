import type { ClusterId } from "../common/cluster-store";
import { clusterStore } from "../common/cluster-store";
import { observable } from "mobx";
import { app, BrowserWindow, dialog, ipcMain, shell, webContents } from "electron"
import windowStateKeeper from "electron-window-state"
import { extensionLoader } from "../extensions/extension-loader";
import { appEventBus } from "../common/event-bus"
import { initMenu } from "./menu";
import { initTray } from "./tray";

export class WindowManager {
  protected mainWindow: BrowserWindow;
  protected splashWindow: BrowserWindow;
  protected windowState: windowStateKeeper.State;
  protected disposers: Record<string, Function> = {};

  @observable activeClusterId: ClusterId;

  constructor(protected proxyPort: number) {
    this.bindEvents();
    this.initMenu();
    this.initTray();
    this.initMainWindow();
  }

  get mainUrl() {
    return `http://localhost:${this.proxyPort}`
  }

  async initMainWindow(showSplash = true) {
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
      this.windowState.manage(this.mainWindow);

      // open external links in default browser (target=_blank, window.open)
      this.mainWindow.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
      });
      this.mainWindow.webContents.on("dom-ready", () => {
        extensionLoader.broadcastExtensions()
      })
      this.mainWindow.on("focus", () => {
        appEventBus.emit({name: "app", action: "focus"})
      })
      this.mainWindow.on("blur", () => {
        appEventBus.emit({name: "app", action: "blur"})
      })

      // clean up
      this.mainWindow.on("closed", () => {
        this.windowState.unmanage();
        this.mainWindow = null;
        this.splashWindow = null;
        app.dock?.hide(); // hide icon in dock (mac-os)
      })
    }
    try {
      if (showSplash) await this.showSplash();
      await this.mainWindow.loadURL(this.mainUrl);
      this.mainWindow.show();
      this.splashWindow?.close();
    } catch (err) {
      dialog.showErrorBox("ERROR!", err.toString())
    }
  }

  protected async initMenu() {
    this.disposers.menuAutoUpdater = initMenu(this);
  }

  protected initTray() {
    this.disposers.trayAutoUpdater = initTray(this);
  }

  protected bindEvents() {
    // track visible cluster from ui
    ipcMain.on("cluster-view:current-id", (event, clusterId: ClusterId) => {
      this.activeClusterId = clusterId;
    });
  }

  async ensureMainWindow(): Promise<BrowserWindow> {
    if (!this.mainWindow) await this.initMainWindow();
    this.mainWindow.show();
    return this.mainWindow;
  }

  sendToView({ channel, frameId, data = [] }: { channel: string, frameId?: number, data?: any[] }) {
    if (frameId) {
      this.mainWindow.webContents.sendToFrame(frameId, channel, ...data);
    } else {
      this.mainWindow.webContents.send(channel, ...data);
    }
  }

  async navigate(url: string, frameId?: number) {
    await this.ensureMainWindow();
    this.sendToView({
      channel: "menu:navigate",
      frameId: frameId,
      data: [url],
    })
  }

  reload() {
    const frameId = clusterStore.getById(this.activeClusterId)?.frameId;
    if (frameId) {
      this.sendToView({ channel: "menu:reload", frameId });
    } else {
      webContents.getFocusedWebContents()?.reload();
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
          nodeIntegration: true
        }
      });
      await this.splashWindow.loadURL("static://splash.html");
    }
    this.splashWindow.show();
  }

  destroy() {
    this.mainWindow.destroy();
    this.splashWindow.destroy();
    this.mainWindow = null;
    this.splashWindow = null;
    Object.entries(this.disposers).forEach(([name, dispose]) => {
      dispose();
      delete this.disposers[name]
    });
  }
}
