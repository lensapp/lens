/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import startTrayInjectable from "../electron-tray/start-tray.injectable";
import reactiveTrayMenuIconInjectable from "./reactive.injectable";

const startReactiveTrayMenuIconInjectable = getInjectable({
  id: "start-reactive-tray-menu-icon",

  instantiate: (di) => {
    const reactiveTrayMenuIcon = di.inject(reactiveTrayMenuIconInjectable);

    return {
      run: async () => {
        await reactiveTrayMenuIcon.start();
      },

      runAfter: di.inject(startTrayInjectable),
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startReactiveTrayMenuIconInjectable;
