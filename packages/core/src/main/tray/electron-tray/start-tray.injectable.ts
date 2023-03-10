/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import electronTrayInjectable from "./electron-tray.injectable";

const startTrayInjectable = getInjectable({
  id: "start-tray",

  instantiate: (di) => ({
    run: () => {
      const electronTray = di.inject(electronTrayInjectable);

      electronTray.start();
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startTrayInjectable;
