/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import packageInfo from "../../../package.json";
import { Menu, Tray } from "electron";
import { autorun } from "mobx";
import { isDevelopment, isWindows } from "../../common/vars";
import type { LensLogger } from "../../common/logger";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../common/utils";
import buildTrayMenuInjectable from "./build-tray-menu.injectable";
import ensureMainWindowInjectable from "../windows/ensure-main-window.injectable";
import trayLoggerInjectable from "./tray-logger.injectable";

// note: instance of Tray should be saved somewhere, otherwise it disappears
export let tray: Tray;

export function getTrayIcon(): string {
  return path.resolve(
    __static,
    isDevelopment ? "../build/tray" : "icons", // copied within electron-builder extras
    "trayIconTemplate.png",
  );
}

interface Dependencies {
  ensureMainWindow: () => void;
  buildTrayMenu: () => Menu;
  logger: LensLogger;
}

function initTrayIcon({ ensureMainWindow, buildTrayMenu, logger }: Dependencies) {
  tray = new Tray(getTrayIcon());
  tray.setToolTip(packageInfo.description);
  tray.setIgnoreDoubleClickEvents(true);

  if (isWindows) {
    tray.on("click", ensureMainWindow);
  }

  const stopUpdating = autorun(() => {
    try {
      tray.setContextMenu(buildTrayMenu());
    } catch (error) {
      logger.error(`building failed`, { error });
    }
  });

  return () => {
    stopUpdating();
    tray?.destroy();
    tray = null;
  };
}

const initTrayIconInjectable = getInjectable({
  instantiate: (di) => bind(initTrayIcon, null, {
    buildTrayMenu: di.inject(buildTrayMenuInjectable),
    ensureMainWindow: di.inject(ensureMainWindowInjectable),
    logger: di.inject(trayLoggerInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default initTrayIconInjectable;

