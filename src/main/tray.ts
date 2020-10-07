import path from "path"
import sharp from "sharp";
import jsdom from "jsdom"
import packageInfo from "../../package.json"
import { dialog, Menu, NativeImage, nativeImage, nativeTheme, Tray } from "electron"
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
export let trayIcon: NativeImage;

export const trayIconPath = isDevelopment
  ? path.resolve(__static, "../src/renderer/components/icon/logo-lens.svg")
  : path.resolve(__static, "logo.svg") // electron-builder's extraResources

// update icon when MacOS dark/light theme has changed
nativeTheme.on("updated", async () => {
  if (tray) {
    trayIcon = await createTrayIconFromSvg();
    tray.setImage(trayIcon);
  }
});

export async function initTray(windowManager: WindowManager) {
  trayIcon = await createTrayIconFromSvg(); // generate icon once on tray activation

  const dispose = autorun(() => {
    const menu = createTrayMenu(windowManager);
    buildTray(trayIcon, menu);
  })
  return () => {
    dispose();
    tray?.destroy();
    tray = null;
  }
}

export async function createTrayIconFromSvg(filePath = trayIconPath): Promise<NativeImage> {
  // modify icon's svg
  const svgDom = await jsdom.JSDOM.fromFile(filePath);
  const svgRoot = svgDom.window.document.body.getElementsByTagName("svg")[0];
  const trayIconColor = nativeTheme.shouldUseDarkColors ? "white" : "black";
  svgRoot.innerHTML += `<style>* {fill: ${trayIconColor} !important;}</style>`
  const svgIconBuffer = Buffer.from(svgRoot.outerHTML);

  // convert to .png or .ico and resize
  const pngIcon = await sharp(svgIconBuffer).png().toBuffer();
  const iconSize = isMac ? 16 : 32; // todo: verify on windows/linux
  return nativeImage.createFromBuffer(pngIcon).resize({
    width: iconSize,
    height: iconSize
  });
}

export async function buildTray(icon: NativeImage, menu: Menu) {
  logger.info("[TRAY]: build start");

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
      click() {
        // note: argument[1] (browserWindow) not available when app is not focused / hidden
        windowManager.runInContextWindow(showAbout);
      },
    },
    {
      label: "Preferences",
      async click() {
        await windowManager.ensureMainWindow()
        windowManager.navigate(preferencesURL());
      },
    },
    {
      label: "Clusters",
      submenu: workspaceStore.workspacesList
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
                  await windowManager.ensureMainWindow()
                  windowManager.navigate(clusterViewURL({ params: { clusterId } }));
                }
              }
            })
          }
        }),
    },
    {
      label: "Check for updates",
      click() {
        windowManager.runInContextWindow(async window => {
          const result = await AppUpdater.checkForUpdates();
          if (!result) {
            dialog.showMessageBoxSync(window, {
              message: "No updates available",
              type: "info",
            })
          }
        })
      },
    },
  ]);
}
