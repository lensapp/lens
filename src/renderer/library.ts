/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";

import { bootstrap } from "./bootstrap";
import * as extensionApi from "./extension-api";
import { registerInjectables } from "./register-injectables";
import type { DiContainer } from "@ogre-tools/injectable";

interface AppConfig {
  di: DiContainer;
}

function startApp(conf: AppConfig) {
  const { di } = conf;
  
  bootstrap(di);
}

export {
  startApp,
  extensionApi,
  registerInjectables,
};
