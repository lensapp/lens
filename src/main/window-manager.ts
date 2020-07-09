import { reaction } from "mobx";
import { BrowserWindow, shell } from "electron"
import windowStateKeeper from "electron-window-state"
import type { ClusterId } from "../common/cluster-store";
import { clusterStore } from "../common/cluster-store";

export class WindowManager {
  protected views = new Map<ClusterId, BrowserWindow>();
  protected disposers = this.bindReactions();

  protected splashWindow = new BrowserWindow({
    width: 500,
    height: 300,
    backgroundColor: "#1e2124",
    center: true,
    frame: false,
    resizable: false,
    show: false,
  });

  // Manage main window size and position with state persistence
  protected windowState = windowStateKeeper({
    defaultHeight: 900,
    defaultWidth: 1440,
  });

  protected bindReactions() {
    return [
      // auto-destroy cluster-view when it's removed
      reaction(() => clusterStore.removedClusters.toJS(), removedClusters => {
        removedClusters.forEach(cluster => {
          this.destroyView(cluster.id);
        });
      })
    ]
  }

  async showSplash() {
    await this.splashWindow.loadURL("static://splash.html")
    this.splashWindow.show();
  }

  hideSplash() {
    this.splashWindow.hide();
  }

  protected async showView(clusterId: ClusterId) {
    const cluster = clusterStore.getById(clusterId);
    if (!cluster) {
      throw new Error(`Can't load view for non-existing cluster="${clusterId}"`);
    }
    const view = this.getView(clusterId);
    const url = cluster.apiUrl.href;
    if (view.webContents.getURL() !== url) {
      await view.loadURL(url);
    }
    view.show();
  }

  getView(clusterId: ClusterId) {
    let view = this.views.get(clusterId);
    if (!view) {
      view = new BrowserWindow({
        show: false,
        x: this.windowState.x,
        y: this.windowState.y,
        width: this.windowState.width,
        height: this.windowState.height,
        backgroundColor: "#1e2124",
        titleBarStyle: "hidden",
        webPreferences: {
          nodeIntegration: true,
        },
      });
      // open external links in default browser (target=_blank, window.open)
      view.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
      });
      this.views.set(clusterId, view);
    }
    return view;
  }

  destroyView(clusterId: ClusterId) {
    const view = this.views.get(clusterId);
    if (view) {
      view.destroy();
      this.views.delete(clusterId);
    }
  }

  destroy() {
    this.disposers.forEach(dispose => dispose());
    this.disposers.length = 0;
    this.views.forEach(view => view.destroy());
    this.views.clear();
    this.splashWindow.destroy();
    this.splashWindow = null;
  }
}
