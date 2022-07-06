/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shellEnv } from "./shell-env";

const shellEnvInjectable = getInjectable({
  id: "shell-env",
  instantiate: () => shellEnv,
  causesSideEffects: true,
});

export default shellEnvInjectable;
