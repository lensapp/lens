import path from "path"
import sharp from "sharp";
import packageInfo from "../../package.json"
import { app, dialog, Menu, nativeImage, Tray } from "electron"
import { isDevelopment, isMac } from "../common/vars";
import { WindowManager } from "./window-manager";
import { showAbout } from "./menu";
import AppUpdater from "./app-updater";
import { preferencesURL } from "../renderer/components/+preferences/preferences.route";

export const trayIcon = isDevelopment
  ? path.resolve(__static, "../src/renderer/components/icon/logo-lens.svg")
  : path.resolve(__static, "logo.svg") // electron-builder's extraResources

export async function setupTrayIcon(windowManager: WindowManager) {
  await app.whenReady();

  const iconSize = isMac ? 16 : 32; // todo: verify on windows/linux
  const pngIcon = await sharp(trayIcon).png().toBuffer();
  const icon = nativeImage.createFromBuffer(pngIcon).resize({
    width: iconSize,
    height: iconSize
  });

  const appTray = new Tray(icon)
  appTray.setToolTip(packageInfo.description)
  appTray.setIgnoreDoubleClickEvents(true);

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

  appTray.setContextMenu(trayMenu);
  return appTray;
}
