/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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

const setupPathForAppDataInIntegrationTesting = (di: DependencyInjectionContainer, appDataPath: string) => {
  const setElectronAppPath = di.inject(setElectronAppPathInjectable);

  setElectronAppPath("appData", appDataPath);
};
