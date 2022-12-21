/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster-types";

export const currentClusterIdInjectionToken = getInjectionToken<ClusterId | undefined>({
  id: "current-cluster-id-token",
});
