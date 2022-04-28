/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Tray } from "electron";
import { autorun } from "mobx";
import { disposer } from "../../common/utils";
import { isWindows } from "../../common/vars";
import ensureMainWindowInjectable from "../window/ensure-main.injectable";
import { createCurrentTrayIcon, watchShouldUseDarkColors } from "./icon";
import trayMenuInjectable from "./tray-menu.injectable";
import packageInfo from "../../../package.json";
import trayLoggerInjectable from "./logger.injectable";

const initTrayInjectable = getInjectable({
  id: "init-tray",
  instantiate: (di) => {
    const ensureMainWindow = di.inject(ensureMainWindowInjectable);
    const trayMenu = di.inject(trayMenuInjectable);
    const logger = di.inject(trayLoggerInjectable);

    return async () => {
      const icon = await createCurrentTrayIcon();
      const dispose = disposer();
      const tray = new Tray(icon);

      tray.setToolTip(packageInfo.description);
      tray.setIgnoreDoubleClickEvents(true);

      dispose.push(watchShouldUseDarkColors(tray));

      if (isWindows) {
        tray.on("click", () => {
          ensureMainWindow()
            .catch(error => logger.error(`Failed to open lens`, { error }));
        });
      }

      dispose.push(
        autorun(() => {
          try {
            tray.setContextMenu(trayMenu.get());
          } catch (error) {
            logger.error(`building failed`, { error });
          }
        }),
        () => {
          tray.destroy();
        },
      );

      return dispose;
    };
  },
});

export default initTrayInjectable;
