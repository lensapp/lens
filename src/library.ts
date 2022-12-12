/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import { registerInjectables } from "./main/register-injectables";
import { afterApplicationIsLoadedInjectionToken } from "./main/start-main-application/runnable-tokens/after-application-is-loaded-injection-token";
import { beforeApplicationIsLoadingInjectionToken } from "./main/start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import { beforeElectronIsReadyInjectionToken } from "./main/start-main-application/runnable-tokens/before-electron-is-ready-injection-token";
import { onLoadOfApplicationInjectionToken } from "./main/start-main-application/runnable-tokens/on-load-of-application-injection-token";
import startMainApplicationInjectable from "./main/start-main-application/start-main-application.injectable";
import * as extensionApi from "./main/extension-api";

interface AppConfig {
  di: DiContainer;
}

function startApp(conf: AppConfig) {
  const { di } = conf;

  return di.inject(startMainApplicationInjectable);
}

export { 
  registerInjectables,
  startApp,
  extensionApi,
  afterApplicationIsLoadedInjectionToken,
  beforeApplicationIsLoadingInjectionToken,
  beforeElectronIsReadyInjectionToken,
  onLoadOfApplicationInjectionToken,
};
