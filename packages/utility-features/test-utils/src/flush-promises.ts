/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { setImmediate, setTimeout } from "timers/promises";

export const flushPromises = async () => {
  await setImmediate();
  await setTimeout(5);
};
