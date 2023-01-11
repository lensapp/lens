/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Main process

import { getDi } from "./getDi";
import { Mobx, LensExtensions, Pty } from "./extension-api";
import { createApp } from "./create-app";

const di = getDi();
const app = createApp({
  di,
  mode: process.env.NODE_ENV || "development",
});

app.start().catch((error) => {
  console.error(error);
  process.exit(1);
});

export { Mobx, LensExtensions, Pty };
