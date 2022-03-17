/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import packageInfo from "../../../package.json";
import type { NativeImage } from "electron";
import { Menu, nativeImage, nativeTheme, Tray } from "electron";
import type { IComputedValue } from "mobx";
import { autorun } from "mobx";
import { showAbout } from "../menu/menu";
import { checkForUpdates, isAutoUpdateEnabled } from "../app-updater";
import type { WindowManager } from "../window-manager";
import logger from "../logger";
import { isWindows, productName } from "../../common/vars";
import { exitApp } from "../exit-app";
import type { Disposer } from "../../common/utils";
import { base64, disposer, getOrInsertWithAsync, toJS } from "../../common/utils";
import type { TrayMenuRegistration } from "./tray-menu-registration";
import sharp from "sharp";
import LogoLens from "../../renderer/components/icon/logo-lens.svg";
import { JSDOM } from "jsdom";


const TRAY_LOG_PREFIX = "[TRAY]";

// note: instance of Tray should be saved somewhere, otherwise it disappears
export let tray: Tray | null = null;

interface CreateTrayIconArgs {
  shouldUseDarkColors: boolean;
  size: number;
  sourceSvg: string;
}

const trayIcons = new Map<boolean, NativeImage>();

async function createTrayIcon({ shouldUseDarkColors, size, sourceSvg }: CreateTrayIconArgs): Promise<NativeImage> {
  return getOrInsertWithAsync(trayIcons, shouldUseDarkColors, async () => {
    const trayIconColor = shouldUseDarkColors ? "white" : "black"; // Invert to show contrast
    const parsedSvg = base64.decode(sourceSvg.split("base64,")[1]);
    const svgDom = new JSDOM(`<body>${parsedSvg}</body>`);
    const svgRoot = svgDom.window.document.body.getElementsByTagName("svg")[0];

    svgRoot.innerHTML += `<style>* {fill: ${trayIconColor} !important;}</style>`;

    const iconBuffer = await sharp(Buffer.from(svgRoot.outerHTML))
      .resize({ width: size, height: size })
      .png()
      .toBuffer();

    return nativeImage.createFromBuffer(iconBuffer);
  });
}

function createCurrentTrayIcon() {
  return createTrayIcon({
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    size: 16,
    sourceSvg: LogoLens,
  });
}

function watchShouldUseDarkColors(tray: Tray): Disposer {
  let prevShouldUseDarkColors = nativeTheme.shouldUseDarkColors;
  const onUpdated = () => {
    if (prevShouldUseDarkColors !== nativeTheme.shouldUseDarkColors) {
      prevShouldUseDarkColors = nativeTheme.shouldUseDarkColors;
      createCurrentTrayIcon()
        .then(img => tray.setImage(img));
    }
  };

  nativeTheme.on("updated", onUpdated);

  return () => nativeTheme.off("updated", onUpdated);
}

export async function initTray(
  windowManager: WindowManager,
  trayMenuItems: IComputedValue<TrayMenuRegistration[]>,
  navigateToPreferences: () => void,
): Promise<Disposer> {
  const icon = await createCurrentTrayIcon();
  const dispose = disposer();

  tray = new Tray(icon);
  tray.setToolTip(packageInfo.description);
  tray.setIgnoreDoubleClickEvents(true);

  dispose.push(watchShouldUseDarkColors(tray));

  if (isWindows) {
    tray.on("click", () => {
      windowManager
        .ensureMainWindow()
        .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to open lens`, { error }));
    });
  }

  dispose.push(
    autorun(() => {
      try {
        const menu = createTrayMenu(windowManager, toJS(trayMenuItems.get()), navigateToPreferences);

        tray?.setContextMenu(menu);
      } catch (error) {
        logger.error(`${TRAY_LOG_PREFIX}: building failed`, { error });
      }
    }),
    () => {
      tray?.destroy();
      tray = null;
    },
  );

  return dispose;
}

function getMenuItemConstructorOptions(trayItem: TrayMenuRegistration): Electron.MenuItemConstructorOptions {
  return {
    ...trayItem,
    submenu: trayItem.submenu ? trayItem.submenu.map(getMenuItemConstructorOptions) : undefined,
    click: trayItem.click ? () => {
      trayItem.click?.(trayItem);
    } : undefined,
  };
}

function createTrayMenu(
  windowManager: WindowManager,
  extensionTrayItems: TrayMenuRegistration[],
  navigateToPreferences: () => void,
): Menu {
  let template: Electron.MenuItemConstructorOptions[] = [
    {
      label: `Open ${productName}`,
      click() {
        windowManager
          .ensureMainWindow()
          .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to open lens`, { error }));
      },
    },
    {
      label: "Preferences",
      click() {
        navigateToPreferences();
      },
    },
  ];

  if (isAutoUpdateEnabled()) {
    template.push({
      label: "Check for updates",
      click() {
        checkForUpdates()
          .then(() => windowManager.ensureMainWindow());
      },
    });
  }

  template = template.concat(extensionTrayItems.map(getMenuItemConstructorOptions));

  return Menu.buildFromTemplate(template.concat([
    {
      label: `About ${productName}`,
      click() {
        windowManager.ensureMainWindow()
          .then(showAbout)
          .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to show Lens About view`, { error }));
      },
    },
    { type: "separator" },
    {
      label: "Quit App",
      click() {
        exitApp();
      },
    },
  ]));
}
