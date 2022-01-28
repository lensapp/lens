/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import loadMetricsInjectable from "./load-metrics.injectable";
import { MetricsRoute } from "./route";

const metricsRouteInjectable = getInjectable({
  instantiate: (di) => new MetricsRoute({
    loadMetrics: di.inject(loadMetricsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default metricsRouteInjectable;
