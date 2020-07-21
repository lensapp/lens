import { autorun, reaction, when } from "mobx";
import { BrowserWindow, shell } from "electron"
import windowStateKeeper from "electron-window-state"
import type { ClusterId } from "../common/cluster-store";
import { clusterStore } from "../common/cluster-store";
import logger from "./logger";

// fixme: remove switching view delay on first load

export class WindowManager {
  protected activeView: BrowserWindow;
  protected splashWindow: BrowserWindow;
  protected noClustersWindow: BrowserWindow;
  protected views = new Map<ClusterId, BrowserWindow>();
  protected disposers: CallableFunction[] = [];
  protected windowState: windowStateKeeper.State;

  constructor(protected proxyPort: number) {
    this.splashWindow = new BrowserWindow({
      width: 500,
      height: 300,
      backgroundColor: "#1e2124",
      center: true,
      frame: false,
      resizable: false,
      show: false,
    });

    // Manage main window size and position with state persistence
    this.windowState = windowStateKeeper({
      defaultHeight: 900,
      defaultWidth: 1440,
    });

    // Manage reactive state
    this.disposers.push(
      // auto-show active cluster window and subscribe for push-events
      reaction(() => clusterStore.activeClusterId, this.activateView, {
        fireImmediately: true,
      }),

      // auto-destroy views for removed clusters
      reaction(() => clusterStore.removedClusters.toJS(), removedClusters => {
        removedClusters.forEach(cluster => {
          this.destroyView(cluster.id);
        });
      }, {
        delay: 25, // fix: destroy later and allow to use view's state in next activateView()
      }),

      // handle no-clusters view
      autorun(() => {
        if (!clusterStore.hasClusters()) {
          this.handleNoClustersView();
        }
      })
    );
  }

  protected async handleNoClustersView() {
    if (!this.noClustersWindow) {
      this.noClustersWindow = this.initView(undefined);
      await this.noClustersWindow.loadURL(`http://no-clusters.localhost:${this.proxyPort}`);
    }
    this.activeView = this.noClustersWindow;
    this.noClustersWindow.show();
    this.hideSplash();
  }

  async showSplash() {
    await this.splashWindow.loadURL("static://splash.html").catch(() => null)
    this.splashWindow.show();
  }

  hideSplash() {
    this.splashWindow.hide();
  }

  getView(clusterId: ClusterId) {
    return this.views.get(clusterId);
  }

  activateView = async (clusterId: ClusterId): Promise<number> => {
    const cluster = clusterStore.getById(clusterId);
    if (!cluster) {
      return;
    }
    try {
      const prevActiveView = this.activeView;
      const isLoadedBefore = !!this.getView(clusterId);
      const view = this.initView(clusterId);
      logger.info(`[WINDOW-MANAGER]: activating cluster view`, {
        id: view.id,
        clusterId: cluster.id,
        contextName: cluster.contextName,
        isLoadedBefore: isLoadedBefore,
      });
      if (prevActiveView !== view) {
        this.activeView = view;
        cluster.activate(); // refresh + reconnect when required
        if (!isLoadedBefore) {
          await when(() => cluster.initialized);
          await view.loadURL(cluster.webContentUrl);
          this.hideSplash();
        }
        // refresh position and hide previous active window
        if (prevActiveView) {
          view.setBounds(prevActiveView.getBounds());
          prevActiveView.hide();
        }
        view.show();
        return view.id;
      }
    } catch (err) {
      logger.error(`[WINDOW-MANAGER]: can't activate cluster view`, {
        clusterId: cluster.id,
        err: String(err),
      });
    }
  }

  protected initView(clusterId: ClusterId): BrowserWindow {
    let view = this.getView(clusterId);
    if (!view) {
      const { width, height, x, y } = this.windowState;
      view = new BrowserWindow({
        show: false,
        x: x, y: y,
        width: width,
        height: height,
        titleBarStyle: "hidden",
        backgroundColor: "#1e2124",
        webPreferences: {
          nodeIntegration: true,
          enableRemoteModule: true,
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
