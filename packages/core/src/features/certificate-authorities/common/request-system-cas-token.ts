/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { PlatformSpecific } from "../../../common/utils/platform-specific-version.injectable";

export type RequestSystemCAs = () => Promise<string[]>;

export const platformSpecificRequestSystemCAsInjectionToken = getInjectionToken<PlatformSpecific<RequestSystemCAs>>({
  id: "platform-specific-request-system-cas-token",
});

export const requestSystemCAsInjectionToken = getInjectionToken<RequestSystemCAs>({
  id: "request-system-cas-token",
});
