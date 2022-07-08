/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isDebuggingInjectable = getInjectable({
  id: "is-debugging",
  instantiate: () => ["true", "1", "yes", "y", "on"].includes((process.env.DEBUG ?? "").toLowerCase()),
  causesSideEffects: true,
});

export default isDebuggingInjectable;
