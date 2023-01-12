/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { randomUUID } from "crypto";

const computeAuthHeaderValueInjectable = getInjectable({
  id: "compute-auth-header-value",
  instantiate: () => () => randomUUID(),
  causesSideEffects: true,
});

export default computeAuthHeaderValueInjectable;
