/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { initTray } from "./tray";
import { getStartableStoppable } from "../../common/utils/get-startable-stoppable";
import showApplicationWindowInjectable from "../start-main-application/lens-window/show-application-window.injectable";
import trayMenuItemsInjectable from "./tray-menu-item/tray-menu-items.injectable";
import trayIconPathInjectable from "./tray-icon-path.injectable";

const trayInjectable = getInjectable({
  id: "tray",

  instantiate: (di) => {
    const trayMenuItems = di.inject(trayMenuItemsInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const trayIconPath = di.inject(trayIconPathInjectable);

    return getStartableStoppable("build-of-tray", () =>
      initTray(
        trayMenuItems,
        showApplicationWindow,
        trayIconPath,
      ),
    );
  },
});

export default trayInjectable;
