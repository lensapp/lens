/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { KubeJsonApi } from "./kube-json-api";

export const apiKubeInjectionToken = getInjectionToken<KubeJsonApi>({
  id: "api-kube-injection-token",
});
