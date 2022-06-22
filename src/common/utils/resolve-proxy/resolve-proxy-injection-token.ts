/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export type ResolveProxy = (url: string) => Promise<string>;

export const resolveProxyInjectionToken = getInjectionToken<ResolveProxy>({
  id: "resolve-proxy",
});
