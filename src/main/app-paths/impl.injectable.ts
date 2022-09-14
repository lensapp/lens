/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pathNames } from "../../common/app-paths/app-path-names";
import { appPathsInjectionToken } from "../../common/app-paths/token";
import { createInitializableState } from "../../common/initializable-state/create";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import { object } from "../../common/utils";
import appNameInjectable from "../../common/vars/app-name.injectable";
import directoryForIntegrationTestingInjectable from "./directory-for-integration-testing/directory-for-integration-testing.injectable";
import getElectronAppPathInjectable from "./get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./set-electron-app-path/set-electron-app-path.injectable";

const appPathsInjectable = createInitializableState({
  id: "app-paths",
  init: (di) => {
    const setElectronAppPath = di.inject(setElectronAppPathInjectable);
    const appName = di.inject(appNameInjectable);
    const getAppPath = di.inject(getElectronAppPathInjectable);
    const directoryForIntegrationTesting = di.inject(directoryForIntegrationTestingInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    if (directoryForIntegrationTesting) {
      setElectronAppPath("appData", directoryForIntegrationTesting);
    }

    const appDataPath = getAppPath("appData");

    setElectronAppPath("userData", joinPaths(appDataPath, appName));

    return object.fromEntries(
      pathNames.map(name => [name, getAppPath(name)] as const),
    );
  },
  injectionToken: appPathsInjectionToken,
});

export default appPathsInjectable;
