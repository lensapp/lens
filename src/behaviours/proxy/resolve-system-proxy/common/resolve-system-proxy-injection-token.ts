/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export type ResolveSystemProxy = (url: string) => Promise<string>;

export const resolveSystemProxyInjectionToken = getInjectionToken<ResolveSystemProxy>({
  id: "resolve-system-proxy",
});
