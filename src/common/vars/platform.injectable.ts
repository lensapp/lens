/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const platformInjectable = getInjectable({
  id: "platform",
  instantiate: () => process.platform,
  causesSideEffects: true,
});

export default platformInjectable;
