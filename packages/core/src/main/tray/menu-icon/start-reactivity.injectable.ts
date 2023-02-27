/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import startTrayInjectable from "../electron-tray/start-tray.injectable";
import reactiveTrayMenuIconInjectable from "./reactive.injectable";

const startReactiveTrayMenuIconInjectable = getInjectable({
  id: "start-reactive-tray-menu-icon",

  instantiate: (di) => ({
    run: () => {
      const reactiveTrayMenuIcon = di.inject(reactiveTrayMenuIconInjectable);

      reactiveTrayMenuIcon.start();
    },

    runAfter: startTrayInjectable,
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startReactiveTrayMenuIconInjectable;
