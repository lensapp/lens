/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const cachedShellEnvInjectable = getInjectable({
  id: "cached-shell-env",
  instantiate: () => new Map<string, Record<string, string | undefined>>(),
});

export default cachedShellEnvInjectable;
