/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Tray } from "electron";
import type { Disposer } from "../../common/utils";
import nativeThemeInjectable from "../electron/native-theme.injectable";
import createCurrentTrayIconInjectable from "./create-current-tray-icon.injectable";

export type TrayIconUpdater = (tray: Tray) => Disposer;

const trayIconUpdaterInjectable = getInjectable({
  id: "tray-icon-updater",
  instantiate: (di): TrayIconUpdater => {
    const nativeTheme = di.inject(nativeThemeInjectable);
    const createCurrentTrayIcon = di.inject(createCurrentTrayIconInjectable);

    return (tray) => {
      let prevShouldUseDarkColors = nativeTheme.shouldUseDarkColors;
      const onUpdated = () => {
        if (prevShouldUseDarkColors !== nativeTheme.shouldUseDarkColors) {
          const localShouldUseDarkColors = prevShouldUseDarkColors = nativeTheme.shouldUseDarkColors;

          createCurrentTrayIcon()
            .then(img => {
              // This guards against rapid changes back and forth
              if (localShouldUseDarkColors === prevShouldUseDarkColors) {
                tray.setImage(img);
              }
            });
        }
      };

      nativeTheme.on("updated", onUpdated);

      return () => {
        nativeTheme.off("updated", onUpdated);
      };
    };
  },
});

export default trayIconUpdaterInjectable;
