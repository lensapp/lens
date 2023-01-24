/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import type { AsyncResult } from "../../common/utils/async-result";

export interface KubeResourceListGroup {
  group: string;
  path: string;
}

export type RequestApiVersions = (cluster: Cluster) => Promise<AsyncResult<KubeResourceListGroup[], Error>>;

export const requestApiVersionsInjectionToken = getInjectionToken<RequestApiVersions>({
  id: "request-api-versions-token",
});
