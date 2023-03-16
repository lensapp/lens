/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";

export type ClusterOverviewUIBlock = {
  id: string;
  Component: React.ElementType
};

export const clusterOverviewUIBlockInjectionToken = getInjectionToken<ClusterOverviewUIBlock>({
  id: "cluster-overview-ui-block-injection-token",
});
