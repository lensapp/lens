/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export interface ChartCacheEntry {
  data: string; // serialized JSON
  mtimeMs: number;
}

export type HelmChartManagerCache = Map<string, ChartCacheEntry>;

const helmChartManagerCacheInjectable = getInjectable({
  id: "helm-chart-manager-cache",
  instantiate: (): HelmChartManagerCache => new Map(),
});

export default helmChartManagerCacheInjectable;
