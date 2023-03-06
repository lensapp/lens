/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import { afterWindowIsOpenedInjectionToken } from "../../start-main-application/runnable-tokens/phases";
import electronAppInjectable from "../electron-app.injectable";
import { runManyFor } from "@k8slens/run-many";

const setupRunnablesAfterWindowIsOpenedInjectable = getInjectable({
  id: "setup-runnables-after-window-is-opened",

  instantiate: (di) => {
    const afterWindowIsOpened = runManyFor(di)(afterWindowIsOpenedInjectionToken);
    const app = di.inject(electronAppInjectable);

    return {
      run: () => {
        app.on("browser-window-created", () => {
          afterWindowIsOpened();
        });
      },
    };
  },

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupRunnablesAfterWindowIsOpenedInjectable;
