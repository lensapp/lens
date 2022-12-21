/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import environmentVariablesInjectable from "../common/utils/environment-variables.injectable";
import startMainApplicationInjectable from "./start-main-application/start-main-application.injectable";

interface AppConfig {
  di: DiContainer;
  mode?: "production" | "development";
}

export async function startApp(conf: AppConfig) {
  const { di, mode } = conf;

  if (mode) {
    const environmentVariables = di.inject(environmentVariablesInjectable);

    environmentVariables.NODE_ENV = mode;
  }

  const startMainApplication = di.inject(startMainApplicationInjectable);

  await startMainApplication();

  return di;
}
