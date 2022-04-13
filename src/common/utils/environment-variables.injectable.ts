/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const environmentVariablesInjectable = getInjectable({
  id: "environment-variables",
  instantiate: () => process.env,
  causesSideEffects: true,
});

export default environmentVariablesInjectable;
