import path from "path"
import packageInfo from "../../package.json"
import { app, dialog, Menu, NativeImage, nativeTheme, Tray } from "electron"
import { autorun } from "mobx";
import { showAbout } from "./menu";
import { AppUpdater } from "./app-updater";
import { WindowManager } from "./window-manager";
import { clusterStore } from "../common/cluster-store";
import { workspaceStore } from "../common/workspace-store";
import { preferencesURL } from "../renderer/components/+preferences/preferences.route";
import { clusterViewURL } from "../renderer/components/cluster-manager/cluster-view.route";
import logger from "./logger";
import { isDevelopment } from "../common/vars";

// note: instance of Tray should be saved somewhere, otherwise it disappears
export let tray: Tray;

// refresh icon when MacOS dark/light theme has changed
nativeTheme.on("updated", () => tray?.setImage(getTrayIcon()));

export function getTrayIcon(isDark = nativeTheme.shouldUseDarkColors): string {
  return path.resolve(
    __static,
    isDevelopment ? "../build/tray" : "icons", // copied within electron-builder extras
    `tray_icon${isDark ? "_dark" : ""}.png`
  )
}

export function initTray(windowManager: WindowManager) {
  const dispose = autorun(() => {
    try {
      const menu = createTrayMenu(windowManager);
      buildTray(getTrayIcon(), menu);
    } catch (err) {
      logger.error(`[TRAY]: building failed: ${err}`);
    }
  })
  return () => {
    dispose();
    tray?.destroy();
    tray = null;
  }
}

export function buildTray(icon: string | NativeImage, menu: Menu) {
  if (!tray) {
    tray = new Tray(icon)
    tray.setToolTip(packageInfo.description)
    tray.setIgnoreDoubleClickEvents(true);
  }

  tray.setImage(icon);
  tray.setContextMenu(menu);

  return tray;
}

export function createTrayMenu(windowManager: WindowManager): Menu {
  return Menu.buildFromTemplate([
    {
      label: "About Lens",
      async click() {
        // note: argument[1] (browserWindow) not available when app is not focused / hidden
        const browserWindow = await windowManager.ensureMainWindow();
        showAbout(browserWindow);
      },
    },
    { type: 'separator' },
    {
      label: "Open Lens",
      async click() {
        await windowManager.ensureMainWindow()
      },
    },
    {
      label: "Preferences",
      click() {
        windowManager.navigate(preferencesURL());
      },
    },
    {
      label: "Clusters",
      submenu: workspaceStore.enabledWorkspacesList
        .filter(workspace => clusterStore.getByWorkspaceId(workspace.id).length > 0) // hide empty workspaces
        .map(workspace => {
          const clusters = clusterStore.getByWorkspaceId(workspace.id);
          return {
            label: workspace.name,
            toolTip: workspace.description,
            submenu: clusters.map(cluster => {
              const { id: clusterId, preferences: { clusterName: label }, online, workspace } = cluster;
              return {
                label: `${online ? '✓' : '\x20'.repeat(3)/*offset*/}${label}`,
                toolTip: clusterId,
                async click() {
                  workspaceStore.setActive(workspace);
                  clusterStore.setActive(clusterId);
                  windowManager.navigate(clusterViewURL({ params: { clusterId } }));
                }
              }
            })
          }
        }),
    },
    {
      label: "Check for updates",
      async click() {
        const result = await AppUpdater.checkForUpdates();
        if (!result) {
          const browserWindow = await windowManager.ensureMainWindow();
          dialog.showMessageBoxSync(browserWindow, {
            message: "No updates available",
            type: "info",
          })
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit App',
      click() {
        app.exit();
      }
    }
  ]);
}
