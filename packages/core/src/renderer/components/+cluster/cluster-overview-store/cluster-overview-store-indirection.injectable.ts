/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import clusterOverviewStoreInjectable from "./cluster-overview-store.injectable";
import { clusterOverviewStoreInjectionToken } from "@k8slens/metrics";

const clusterOverviewStoreIndirectionInjectable = getInjectable({
  id: "cluster-overview-store-indirection",
  instantiate: (di) => di.inject(clusterOverviewStoreInjectable),
  injectionToken: clusterOverviewStoreInjectionToken
});

export default clusterOverviewStoreIndirectionInjectable;
