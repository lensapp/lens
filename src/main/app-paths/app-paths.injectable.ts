/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { getAppPaths } from "./get-app-paths";
import getElectronAppPathInjectable from "./get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./set-electron-app-path/set-electron-app-path.injectable";
import path from "path";
import appNameInjectable from "./app-name/app-name.injectable";
import directoryForIntegrationTestingInjectable from "./directory-for-integration-testing/directory-for-integration-testing.injectable";
import { appPathsInjectionToken } from "../../common/app-paths/app-path-injection-token";

const appPathsInjectable = getInjectable({
  instantiate: (di) => {
    const directoryForIntegrationTesting = di.inject(directoryForIntegrationTestingInjectable);
    const setElectronAppPath = di.inject(setElectronAppPathInjectable);

    if (directoryForIntegrationTesting) {
      // TODO: this kludge is here only until we have a proper place to setup integration testing.
      setElectronAppPath("appData", directoryForIntegrationTesting);
    }

    // Set path for user data
    const appName = di.inject(appNameInjectable);
    const getAppPath = di.inject(getElectronAppPathInjectable);
    const appDataPath = getAppPath("appData");

    setElectronAppPath("userData", path.join(appDataPath, appName));

    return getAppPaths({
      getAppPath: di.inject(getElectronAppPathInjectable),
    });
  },
  injectionToken: appPathsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default appPathsInjectable;
