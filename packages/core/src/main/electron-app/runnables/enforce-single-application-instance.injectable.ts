/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import requestSingleInstanceLockInjectable from "../features/request-single-instance-lock.injectable";
import quitAppInjectable from "../features/exit-app.injectable";

const enforceSingleApplicationInstanceInjectable = getInjectable({
  id: "enforce-single-application-instance",

  instantiate: (di) => ({
    run: () => {
      const requestSingleInstanceLock = di.inject(requestSingleInstanceLockInjectable);
      const quitApp = di.inject(quitAppInjectable);

      if (!requestSingleInstanceLock()) {
        quitApp();
      }

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default enforceSingleApplicationInstanceInjectable;
