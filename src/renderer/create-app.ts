/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";

import { bootstrap } from "./bootstrap";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import nodeEnvInjectionToken from "../common/vars/node-env-injection-token";
import { runInAction } from "mobx";
import { registerInjectables } from "./register-injectables";

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
  
  return {
    start: () => bootstrap(di),
  };
}
