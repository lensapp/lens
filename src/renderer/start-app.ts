/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";

import { bootstrap } from "./bootstrap";
import type { DiContainer } from "@ogre-tools/injectable";
import environmentVariablesInjectable from "../common/utils/environment-variables.injectable";

interface AppConfig {
  di: DiContainer;
  mode?: "production" | "development";
}

export function startApp(conf: AppConfig) {
  const { di, mode } = conf;

  if (mode) {
    const environmentVariables = di.inject(environmentVariablesInjectable);

    environmentVariables.NODE_ENV = mode;
  }
  
  bootstrap(di);
}
