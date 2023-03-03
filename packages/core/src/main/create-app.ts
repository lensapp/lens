/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import type { CreateApplication } from "../common/create-app";
import nodeEnvInjectionToken from "../common/vars/node-env-injection-token";
import { getDi } from "./getDi";
import { registerInjectables } from "./register-injectables";
import startMainApplicationInjectable from "./start-main-application/start-main-application.injectable";

export const createApplication: CreateApplication = (config) => {
  const { mode } = config;
  const di = getDi();

  runInAction(() => {
    di.register(getInjectable({
      id: "node-env",
      instantiate: () => mode,
      injectionToken: nodeEnvInjectionToken,
    }));

    registerInjectables(di);
  });

  return {
    start: di.inject(startMainApplicationInjectable),
    di,
  };
};
