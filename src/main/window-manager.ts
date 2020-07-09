import { reaction } from "mobx";
import { BrowserWindow, shell } from "electron"
import windowStateKeeper from "electron-window-state"
import type { ClusterId } from "../common/cluster-store";
import { clusterStore } from "../common/cluster-store";

// todo: smooth switching btw clusters (e.g. wait ready-state before switching window)
// todo: devtools + manage main-window size btw views

export class WindowManager {
  protected activeView: BrowserWindow;
  protected views = new Map<ClusterId, BrowserWindow>();

  protected disposers = [
    // auto-destroy view when cluster removed
    reaction(() => clusterStore.removedClusters.toJS(), removedClusters => {
      removedClusters.forEach(cluster => {
        this.destroyView(cluster.id);
      });
    })
  ];

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

  async showSplash() {
    await this.splashWindow.loadURL("static://splash.html")
    this.splashWindow.show();
  }

  hideSplash() {
    this.splashWindow.hide();
  }

  async showView(clusterId: ClusterId) {
    const cluster = clusterStore.getById(clusterId);
    if (!cluster) {
      throw new Error(`Can't load lens for non-existing cluster="${clusterId}"`);
    }
    const activeView = this.activeView;
    const view = this.getView(clusterId);
    if (view !== activeView) {
      this.activeView = view;
      if (activeView) {
        view.setBounds(activeView.getBounds()); // update position from previous window
      }
      const url = cluster.apiUrl.href;
      const isLoaded = url === view.webContents.getURL();
      if (!isLoaded) {
        await view.loadURL(url);
      }
      view.show();
    }
  }

  protected getView(clusterId: ClusterId) {
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
          // partition: "lens-app", // todo: reuse session?
          nodeIntegration: true,
        },
      });
      // open external links in default browser (target=_blank, window.open)
      view.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
      });
      this.views.set(clusterId, view);
      this.windowState.manage(view);
    }
    return view;
  }

  protected destroyView(clusterId: ClusterId) {
    const view = this.views.get(clusterId);
    if (view) {
      view.destroy();
      this.views.delete(clusterId);
    }
  }

  destroy() {
    this.windowState.unmanage();
    this.disposers.forEach(dispose => dispose());
    this.disposers.length = 0;
    this.views.forEach(view => view.destroy());
    this.views.clear();
    this.splashWindow.destroy();
    this.splashWindow = null;
    this.activeView = null;
  }
}
