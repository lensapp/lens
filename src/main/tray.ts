import path from "path"
import { app, Menu, nativeImage, Tray } from "electron"
import { isDevelopment } from "../common/vars";
import packageInfo from "../../package.json"

export async function setupTrayIcon() {
  await app.whenReady();

  const iconPath = path.resolve(__static, isDevelopment ? "../build" : "", "icon.png");

  // todo: https://www.electronjs.org/docs/api/native-image#high-resolution-image
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

  const appTray = new Tray(icon);
  appTray.setToolTip(packageInfo.description)
  appTray.setIgnoreDoubleClickEvents(true)

  const trayMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' }
  ]);

  appTray.setContextMenu(trayMenu);
  return appTray;
}
