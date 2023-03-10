/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { flushPromises } from "./flush-promises";

export const getPromiseStatus = async (promise: Promise<unknown>) => {
  const status = { fulfilled: false };

  promise.finally(() => {
    status.fulfilled = true;
  });

  await flushPromises();

  return status;
};
