/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Main process

import { getDi } from "./getDi";
import { Mobx, LensExtensions, Pty } from "./extension-api";
import { startApp } from "./start-app";

const di = getDi();

startApp({
  di,
});

export { Mobx, LensExtensions, Pty };
