/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Handler } from "./handler";

/**
 * Lifecycle describes actions that the management system should take in response to container
 * lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container
 * blocks until the action is complete, unless the container process fails, in which case the
 * handler is aborted.
 */
export interface Lifecycle {
  postStart?: Handler;
  preStop?: Handler;
}
