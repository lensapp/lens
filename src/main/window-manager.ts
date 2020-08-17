import type { ClusterId } from "../common/cluster-store";
import { BrowserWindow, dialog, ipcMain, shell, WebContents, webContents } from "electron"
import windowStateKeeper from "electron-window-state"
import { observable } from "mobx";
import { initMenu } from "./menu";

export class WindowManager {
  protected mainView: BrowserWindow;
  protected splashWindow: BrowserWindow;
  protected windowState: windowStateKeeper.State;

  @observable activeClusterId: ClusterId;

  constructor(protected proxyPort: number) {
    // Manage main window size and position with state persistence
    this.windowState = windowStateKeeper({
      defaultHeight: 900,
      defaultWidth: 1440,
    });

    const { width, height, x, y } = this.windowState;
    this.mainView = new BrowserWindow({
      x, y, width, height,
      show: false,
      minWidth: 900,
      minHeight: 760,
      titleBarStyle: "hidden",
      backgroundColor: "#1e2124",
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        enableRemoteModule: true,
      },
    });
    this.windowState.manage(this.mainView);

    // open external links in default browser (target=_blank, window.open)
    this.mainView.webContents.on("new-window", (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    // track visible cluster from ui
    ipcMain.on("cluster-view:change", (event, clusterId: ClusterId) => {
      this.activeClusterId = clusterId;
    });

    // load & show app
    this.showMain();
    initMenu(this);
  }

  navigate({ url, channel, frameId }: { url: string, channel: string, frameId?: number }) {
    if (frameId) {
      this.mainView.webContents.sendToFrame(frameId, channel, url);
    } else {
      this.mainView.webContents.send(channel, url);
    }
  }

  async showMain() {
    try {
      await this.showSplash();
      await this.mainView.loadURL(`http://localhost:${this.proxyPort}`)
      this.mainView.show();
      this.splashWindow.hide();
    } catch (err) {
      dialog.showErrorBox("ERROR!", err.toString())
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
      });
      await this.splashWindow.loadURL("static://splash.html");
    }
    this.splashWindow.show();
  }

  destroy() {
    this.windowState.unmanage();
    this.splashWindow.destroy();
    this.mainView.destroy();
  }
}
