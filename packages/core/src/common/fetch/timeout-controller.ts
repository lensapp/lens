/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { formatDuration } from "@k8slens/utilities";

/**
 * Creates an AbortController with an associated timeout
 * @param timeout The number of milliseconds before this controller will auto abort
 */
export function withTimeout(timeout: number): AbortController {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(`Operation timed out: timeout ${formatDuration(timeout)}`), timeout);

  controller.signal.addEventListener("abort", () => clearTimeout(id));

  return controller;
}
