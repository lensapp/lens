import path from "path"
import sharp from "sharp";
import packageInfo from "../../package.json"
import { app, dialog, Menu, nativeImage, Tray } from "electron"
import { isDevelopment, isMac } from "../common/vars";
import { autorun } from "mobx";
import { showAbout } from "./menu";
import { AppUpdater } from "./app-updater";
import { WindowManager } from "./window-manager";
import { clusterStore } from "../common/cluster-store";
import { workspaceStore } from "../common/workspace-store";
import { preferencesURL } from "../renderer/components/+preferences/preferences.route";
import { clusterViewURL } from "../renderer/components/cluster-manager/cluster-view.route";
import logger from "./logger";

// note: instance of Tray should be saved somewhere, otherwise it disappears
export let tray: Tray;

export const trayIcon = isDevelopment
  ? path.resolve(__static, "../src/renderer/components/icon/logo-lens.svg")
  : path.resolve(__static, "logo.svg") // electron-builder's extraResources

export function initTray(windowManager: WindowManager) {
  return autorun(() => buildTrayMenu(windowManager), {
    delay: 100
  })
}

export async function buildTrayMenu(windowManager: WindowManager) {
  // note: browserWindow not available within menuItem.click() as argument[1] when app is not focused / hidden
  const trayMenu = Menu.buildFromTemplate([
    {
      label: "About Lens",
      click() {
        windowManager.bringToTop();
        showAbout(windowManager.mainView);
      },
    },
    {
      label: "Preferences",
      click() {
        windowManager.bringToTop();
        windowManager.navigate(preferencesURL());
      },
    },
    {
      label: "Clusters",
      submenu: workspaceStore.workspacesList.map(workspace => {
        const clusters = clusterStore.getByWorkspaceId(workspace.id);
        return {
          label: workspace.name,
          toolTip: workspace.description,
          submenu: clusters.map(({ id: clusterId, contextName: label }) => {
            return {
              label,
              click() {
                windowManager.bringToTop();
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
          windowManager.bringToTop();
          dialog.showMessageBoxSync({
            message: "No updates available",
            type: "info",
          })
        }
      },
    },
  ]);

  // note: all "await"-s must be defined *AFTER* getting observables for proper mobx reactions
  await app.whenReady();
  logger.info('[TRAY]: building tray icon and menu');

  const iconSize = isMac ? 16 : 32; // todo: verify on windows/linux
  const pngIcon = await sharp(trayIcon).png().toBuffer();
  const icon = nativeImage.createFromBuffer(pngIcon).resize({
    width: iconSize,
    height: iconSize
  });

  if (tray) {
    tray.destroy(); // remove old tray on update
  }

  tray = new Tray(icon)
  tray.setToolTip(packageInfo.description)
  tray.setIgnoreDoubleClickEvents(true);
  tray.setContextMenu(trayMenu);

  return tray;
}
