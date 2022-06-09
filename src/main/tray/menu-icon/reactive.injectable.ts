/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import discoveredUpdateVersionInjectable from "../../../common/application-update/discovered-update-version/discovered-update-version.injectable";
import { getStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import electronTrayInjectable from "../electron-tray/electron-tray.injectable";
import trayIconPathsInjectable from "../tray-icon-path.injectable";

const reactiveTrayMenuIconInjectable = getInjectable({
  id: "reactive-tray-menu-icon",
  instantiate: (di) => {
    const discoveredUpdateVersion = di.inject(discoveredUpdateVersionInjectable);
    const electronTray = di.inject(electronTrayInjectable);
    const trayIconPaths = di.inject(trayIconPathsInjectable);

    return getStartableStoppable("reactive-tray-menu-icon", () => (
      reaction(
        () => discoveredUpdateVersion.value.get(),
        updateVersion => {
          if (updateVersion) {
            electronTray.setIconPath(trayIconPaths.updateAvailable);
          } else {
            electronTray.setIconPath(trayIconPaths.normal);
          }
        },
        {
          fireImmediately: true,
        },
      )
    ));
  },
});

export default reactiveTrayMenuIconInjectable;
