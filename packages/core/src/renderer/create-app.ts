/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";

import { bootstrap } from "./bootstrap";
import { getInjectable } from "@ogre-tools/injectable";
import nodeEnvInjectionToken from "../common/vars/node-env-injection-token";
import { runInAction } from "mobx";
import { registerInjectables } from "./register-injectables";
import type { CreateApplication } from "../common/create-app";
import { getDi } from "./getDi";

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
    start: () => bootstrap(di),
    di,
  };
};
