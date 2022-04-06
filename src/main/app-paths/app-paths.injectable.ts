/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type {
  DiContainerForSetup } from "@ogre-tools/injectable";
import {
  getInjectable,
} from "@ogre-tools/injectable";

import {
  appPathsInjectionToken,
  appPathsIpcChannel,
} from "../../common/app-paths/app-path-injection-token";

import registerChannelInjectable from "./register-channel/register-channel.injectable";
import { getAppPaths } from "./get-app-paths";
import getElectronAppPathInjectable from "./get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./set-electron-app-path/set-electron-app-path.injectable";
import appNameInjectable from "./app-name/app-name.injectable";
import directoryForIntegrationTestingInjectable from "./directory-for-integration-testing/directory-for-integration-testing.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";

const appPathsInjectable = getInjectable({
  id: "app-paths",

  setup: async (di) => {
    const directoryForIntegrationTesting = await di.inject(
      directoryForIntegrationTestingInjectable,
    );

    if (directoryForIntegrationTesting) {
      await setupPathForAppDataInIntegrationTesting(di, directoryForIntegrationTesting);
    }

    await setupPathForUserData(di);
    await registerAppPathsChannel(di);
  },

  instantiate: (di) =>
    getAppPaths({ getAppPath: di.inject(getElectronAppPathInjectable) }),

  injectionToken: appPathsInjectionToken,
});

export default appPathsInjectable;

const registerAppPathsChannel = async (di: DiContainerForSetup) => {
  const registerChannel = await di.inject(registerChannelInjectable);
  const appPaths = await di.inject(appPathsInjectable);

  registerChannel(appPathsIpcChannel, () => appPaths);
};

const setupPathForUserData = async (di: DiContainerForSetup) => {
  const setElectronAppPath = await di.inject(setElectronAppPathInjectable);
  const appName = await di.inject(appNameInjectable);
  const getAppPath = await di.inject(getElectronAppPathInjectable);
  const joinPaths = await di.inject(joinPathsInjectable);

  const appDataPath = getAppPath("appData");

  setElectronAppPath("userData", joinPaths(appDataPath, appName));
};

// Todo: this kludge is here only until we have a proper place to setup integration testing.
const setupPathForAppDataInIntegrationTesting = async (di: DiContainerForSetup, appDataPath: string) => {
  const setElectronAppPath = await di.inject(setElectronAppPathInjectable);

  setElectronAppPath("appData", appDataPath);
};
