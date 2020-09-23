import type { ClusterId } from "../common/cluster-store";
import { clusterStore } from "../common/cluster-store";
import { BrowserWindow, dialog, ipcMain, shell, webContents } from "electron"
import windowStateKeeper from "electron-window-state"
import { observable } from "mobx";
import { initMenu } from "./menu";
import { userStore } from "../common/user-store";

export class WindowManager {
  protected mainView: BrowserWindow;
  protected splashWindow: BrowserWindow;
  protected windowState: windowStateKeeper.State;

  @observable activeClusterId: ClusterId;

  constructor(protected proxyPort: number, protected keycloakPort: number) {
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

    // handle external links
    this.mainView.webContents.on("will-navigate", (event, link) => {
      if (link.startsWith("http://localhost")) {
        return;
      }
      if (link.startsWith("https://a69adcd0687194b2b8adebdbe93f2a02-977850409.eu-west-2.elb.amazonaws.com")) {
        return;
      }
      if (link.startsWith("http://a09bfce9ea3074e25b8e5e7b1df576fd-1162277427.eu-west-2.elb.amazonaws.com")) {
        return;
      }
      
      event.preventDefault();
      shell.openExternal(link);
    })

    // open external links in default browser (target=_blank, window.open)
    this.mainView.webContents.on("new-window", (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    // track visible cluster from ui
    ipcMain.on("cluster-view:current-id", (event, clusterId: ClusterId) => {
      this.activeClusterId = clusterId;
    });

    // load & show app
    this.showKeycloak();
    initMenu(this);
  }

  navigate({ url, channel, frameId }: { url: string, channel: string, frameId?: number }) {
    if (frameId) {
      this.mainView.webContents.sendToFrame(frameId, channel, url);
    } else {
      this.mainView.webContents.send(channel, url);
    }
  }

  reload({ channel }: { channel: string }) {
    const frameId = clusterStore.getById(this.activeClusterId)?.frameId;
    if (frameId) {
      this.mainView.webContents.sendToFrame(frameId, channel);
    } else {
      webContents.getFocusedWebContents()?.reload();
    }
  }

  public async showKeycloak() {
    try {
      await this.showSplash();
      await this.mainView.loadURL(`http://localhost:${this.keycloakPort}`)
      this.mainView.show();
      this.splashWindow.close();
    } catch (err) {
      dialog.showErrorBox("ERROR!", err.toString())
    }
  }

  public async showLogout() {
    try {
      userStore.saveLastLoggedInUser(userStore.token.preferredUserName);
      await this.mainView.loadURL(`http://localhost:${this.keycloakPort}?logout=true`)
      this.mainView.show();
    } catch (err) {
      dialog.showErrorBox("ERROR!", err.toString())
    }
  }

  public async showMain() {
    try {
      //await this.showSplash();
      await this.mainView.loadURL(`http://localhost:${this.proxyPort}`)
      this.mainView.show();
      //this.splashWindow.close();
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
        webPreferences: {
          nodeIntegration: true
        }
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
