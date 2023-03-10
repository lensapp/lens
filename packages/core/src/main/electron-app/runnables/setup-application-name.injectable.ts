/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appNameInjectable from "../../../common/vars/app-name.injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import electronAppInjectable from "../electron-app.injectable";

const setupApplicationNameInjectable = getInjectable({
  id: "setup-application-name",

  instantiate: (di) => ({
    run: () => {
      const app = di.inject(electronAppInjectable);
      const appName = di.inject(appNameInjectable);

      app.setName(appName);

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupApplicationNameInjectable;
