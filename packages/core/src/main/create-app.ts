/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import nodeEnvInjectionToken from "../common/vars/node-env-injection-token";
import { registerInjectables } from "./register-injectables";
import startMainApplicationInjectable from "./start-main-application/start-main-application.injectable";

interface AppConfig {
  di: DiContainer;
  mode: string;
}

export function createApp(conf: AppConfig) {
  const { di, mode } = conf;

  runInAction(() => {
    di.register(getInjectable({
      id: "node-env",
      instantiate: () => mode,
      injectionToken: nodeEnvInjectionToken,
    }));

    registerInjectables(di);
  });

  const startMainApplication = di.inject(startMainApplicationInjectable);

  return {
    start: () => startMainApplication(),
  };
}
