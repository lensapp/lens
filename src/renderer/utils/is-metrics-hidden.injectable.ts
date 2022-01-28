/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ClusterMetricsResourceType } from "../../common/cluster-types";
import activeClusterEntityInjectable from "../catalog/active-cluster-entity.injectable";

const isMetricHiddenInjectable = getInjectable({
  instantiate: (di, { metricType }: { metricType: ClusterMetricsResourceType }) => Boolean(di.inject(activeClusterEntityInjectable)?.isMetricHidden(metricType)),
  lifecycle: lifecycleEnum.transient,
});

export default isMetricHiddenInjectable;
