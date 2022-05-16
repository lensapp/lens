/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isProductionInjectable = getInjectable({
  id: "is-production",
  instantiate: () => process.env.NODE_ENV === "production",
  causesSideEffects: true,
});

export default isProductionInjectable;
