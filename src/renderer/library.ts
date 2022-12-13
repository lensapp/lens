/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";

import * as extensionApi from "./extension-api";
import { registerInjectables } from "./register-injectables";
import type { startApp } from "./start-app";

export {
  startApp,
  extensionApi,
  registerInjectables,
};
