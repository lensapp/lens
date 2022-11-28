/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appNameInjectable from "../../../common/vars/app-name.injectable";
import { beforeElectronIsReadyInjectionToken } from "../../start-main-application/runnable-tokens/before-electron-is-ready-injection-token";
import electronAppInjectable from "../electron-app.injectable";

const setupApplicationNameInjectable = getInjectable({
  id: "setup-application-name",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const appName = di.inject(appNameInjectable);

    return {
      id: "setup-application-name",
      run: () => {
        app.setName(appName);

        return undefined;
      },
    };
  },

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupApplicationNameInjectable;
