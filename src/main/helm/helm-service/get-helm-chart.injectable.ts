/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getActiveHelmRepositoryInjectable from "../repositories/get-active-helm-repository.injectable";
import type { HelmRepo } from "../../../common/helm/helm-repo";
import helmChartManagerInjectable from "../helm-chart-manager.injectable";

const getHelmChartInjectable = getInjectable({
  id: "get-helm-chart",

  instantiate: (di) => {
    const getActiveHelmRepository = di.inject(getActiveHelmRepositoryInjectable);
    const getChartManager = (repo: HelmRepo) => di.inject(helmChartManagerInjectable, repo);

    return async (repoName: string, chartName: string, version = "") => {
      const repo = await getActiveHelmRepository(repoName);

      if (!repo) {
        return undefined;
      }

      const chartManager = getChartManager(repo);

      return {
        readme: await chartManager.getReadme(chartName, version),
        versions: await chartManager.chartVersions(chartName),
      };
    };
  },

  causesSideEffects: true,
});

export default getHelmChartInjectable;
