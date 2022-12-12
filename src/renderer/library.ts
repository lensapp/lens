/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";

import { bootstrap } from "./bootstrap";
import * as extensionApi from "./extension-api";
import { registerInjectables } from "./register-injectables";

export {
  bootstrap,
  extensionApi,
  registerInjectables,
};
