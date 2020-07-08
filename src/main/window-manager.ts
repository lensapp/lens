import { BrowserView, BrowserWindow, shell } from "electron"
import { reaction } from "mobx";
import windowStateKeeper from "electron-window-state"
import type { ClusterId } from "../common/cluster-store";
import { clusterStore } from "../common/cluster-store";
import { tracker } from "../common/tracker";

export interface WindowManagerParams {
  showSplash?: boolean;
}

export class WindowManager {
  protected mainWindow: BrowserWindow;
  protected splashWindow?: BrowserWindow;
  protected windowState: windowStateKeeper.State;
  protected views = new Map<ClusterId, BrowserView>();
  protected disposers: Function[] = [];

  constructor(protected params: WindowManagerParams = {}) {
    this.params = { showSplash: true, ...params };

    // Manage main window size and position with state persistence
    this.windowState = windowStateKeeper({
      defaultHeight: 900,
      defaultWidth: 1440,
    });

    this.mainWindow = new BrowserWindow({
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

    // Splash-screen window with loading indicator
    this.splashWindow = new BrowserWindow({
      width: 500,
      height: 300,
      backgroundColor: "#1e2124",
      center: true,
      frame: false,
      resizable: false,
      show: false,
    });
    this.splashWindow.loadURL("static://splash.html")

    // Hook window state manager into window lifecycle
    this.windowState.manage(this.mainWindow);

    // Disallow closing main window
    this.mainWindow.on("close", (evt) => {
      evt.preventDefault();
    });

    // Open external links in default browser (target=_blank, window.open)
    this.mainWindow.webContents.on("new-window", (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    // Track main window focus
    this.mainWindow.on("focus", () => {
      tracker.event("app", "focus")
    });

    // Clean up views for removed clusters
    this.disposers.push(
      reaction(() => clusterStore.removedClusters.toJS(), removedClusters => {
        removedClusters.forEach(cluster => {
          const lensView = this.getView(cluster.id);
          if (lensView) {
            lensView.destroy();
            this.views.delete(cluster.id);
          }
        });
      })
    );
  }

  setView(clusterId: ClusterId) {
    const view = this.getView(clusterId)
    this.mainWindow.setBrowserView(view);
  }

  getView(clusterId: ClusterId): BrowserView {
    let view = this.views.get(clusterId);
    if (!view) {
      view = new BrowserView({
        webPreferences: {
          nodeIntegration: true
        }
      })
      // view.setBackgroundColor("#878686");
      // view.setAutoResize({ horizontal: true, vertical: true });
      // view.webContents.loadURL("data:text/html;charset=utf-8,<b>TEST</b>")
      this.views.set(clusterId, view);
    }
    return view;
  }

  async loadURL(url: string) {
    if (this.params.showSplash) {
      this.splashWindow.show();
    }
    await this.mainWindow.loadURL(url);
    this.mainWindow.show();
    this.splashWindow.hide();
  }

  destroy() {
    this.disposers.forEach(dispose => dispose());
    this.disposers.length = 0;
    this.views.forEach(view => view.destroy());
    this.views.clear();
    this.mainWindow.destroy();
    this.splashWindow.destroy();
    this.mainWindow = null;
    this.splashWindow = null;
  }
}
