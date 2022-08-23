/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../common/helm/helm-repo";
import { HelmChartManager } from "./helm-chart-manager";
import helmChartManagerCacheInjectable from "./helm-chart-manager-cache.injectable";
import loggerInjectable from "../../common/logger.injectable";

const helmChartManagerInjectable = getInjectable({
  id: "helm-chart-manager",

  instantiate: (di, repo: HelmRepo) => {
    const cache = di.inject(helmChartManagerCacheInjectable);
    const logger = di.inject(loggerInjectable);

    return new HelmChartManager(repo, { cache, logger });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, repo: HelmRepo) => repo.name,
  }),
});

export default helmChartManagerInjectable;
