/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import {
  DependencyInjectionContainer,
  getInjectable,
  lifecycleEnum,
} from "@ogre-tools/injectable";

import {
  appPathsInjectionToken,
  appPathsIpcChannel,
} from "../../common/app-paths/app-path-injection-token";

import registerChannelInjectable from "./register-channel/register-channel.injectable";
import { getAppPaths } from "./get-app-paths";
import getElectronAppPathInjectable from "./get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./set-electron-app-path/set-electron-app-path.injectable";
import path from "path";
import appNameInjectable from "./app-name/app-name.injectable";
import directoryForIntegrationTestingInjectable from "./directory-for-integration-testing/directory-for-integration-testing.injectable";

const appPathsInjectable = getInjectable({
  setup: (di) => {
    const directoryForIntegrationTesting = di.inject(
      directoryForIntegrationTestingInjectable,
    );

    if (directoryForIntegrationTesting) {
      setupPathForAppDataInIntegrationTesting(di, directoryForIntegrationTesting);
    }

    setupPathForUserData(di);
    registerAppPathsChannel(di);
  },

  instantiate: (di) =>
    getAppPaths({ getAppPath: di.inject(getElectronAppPathInjectable) }),

  injectionToken: appPathsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default appPathsInjectable;

const registerAppPathsChannel = (di: DependencyInjectionContainer) => {
  const registerChannel = di.inject(registerChannelInjectable);

  registerChannel(appPathsIpcChannel, () => di.inject(appPathsInjectable));
};

const setupPathForUserData = (di: DependencyInjectionContainer) => {
  const setElectronAppPath = di.inject(setElectronAppPathInjectable);
  const appName = di.inject(appNameInjectable);
  const getAppPath = di.inject(getElectronAppPathInjectable);

  const appDataPath = getAppPath("appData");

  setElectronAppPath("userData", path.join(appDataPath, appName));
};

// Todo: this kludge is here only until we have a proper place to setup integration testing.
const setupPathForAppDataInIntegrationTesting = (di: DependencyInjectionContainer, appDataPath: string) => {
  const setElectronAppPath = di.inject(setElectronAppPathInjectable);

  setElectronAppPath("appData", appDataPath);
};
