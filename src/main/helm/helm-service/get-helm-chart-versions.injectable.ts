/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { HelmChartManager } from "../helm-chart-manager";
import getActiveHelmRepositoryInjectable from "../repositories/get-active-helm-repository.injectable";

const getHelmChartVersionsInjectable = getInjectable({
  id: "get-helm-chart-versions",

  instantiate: (di) => {
    const getActiveHelmRepository = di.inject(getActiveHelmRepositoryInjectable);

    return async (repoName: string, chartName: string) => {
      const repo = await getActiveHelmRepository(repoName);

      if (!repo) {
        return undefined;
      }

      return HelmChartManager.forRepo(repo).chartVersions(chartName);
    };
  },

  causesSideEffects: true,
});

export default getHelmChartVersionsInjectable;
