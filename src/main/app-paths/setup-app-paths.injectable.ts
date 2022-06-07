/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AppPaths } from "../../common/app-paths/app-path-injection-token";
import getElectronAppPathInjectable from "./get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./set-electron-app-path/set-electron-app-path.injectable";
import appNameInjectable from "./app-name/app-name.injectable";
import directoryForIntegrationTestingInjectable from "./directory-for-integration-testing/directory-for-integration-testing.injectable";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import { pathNames } from "../../common/app-paths/app-path-names";
import { fromPairs, map } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import { beforeElectronIsReadyInjectionToken } from "../start-main-application/runnable-tokens/before-electron-is-ready-injection-token";

const setupAppPathsInjectable = getInjectable({
  id: "setup-app-paths",

  instantiate: (di) => {
    const setElectronAppPath = di.inject(setElectronAppPathInjectable);
    const appName = di.inject(appNameInjectable);
    const getAppPath = di.inject(getElectronAppPathInjectable);
    const appPathsState = di.inject(appPathsStateInjectable);
    const directoryForIntegrationTesting = di.inject(directoryForIntegrationTestingInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return {
      run: () => {
        if (directoryForIntegrationTesting) {
          setElectronAppPath("appData", directoryForIntegrationTesting);
        }

        const appDataPath = getAppPath("appData");

        setElectronAppPath("userData", joinPaths(appDataPath, appName));

        const appPaths = pipeline(
          pathNames,
          map(name => [name, getAppPath(name)]),
          fromPairs,
        ) as AppPaths;

        appPathsState.set(appPaths);
      },
    };
  },

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupAppPathsInjectable;
