/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const idleCallbackTimeoutInjectable = getInjectable({
  id: "idle-callback-timeout",
  instantiate: () => 1000,
});

export default idleCallbackTimeoutInjectable;
