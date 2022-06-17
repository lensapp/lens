/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { HelmChartManager } from "../helm-chart-manager";
import getActiveHelmRepositoryInjectable from "../repositories/get-active-helm-repository.injectable";

const getHelmChartValuesInjectable = getInjectable({
  id: "get-helm-chart-values",

  instantiate: (di) => {
    const getActiveHelmRepository = di.inject(getActiveHelmRepositoryInjectable);

    return async (repoName: string, chartName: string, version = "") => {
      const repo = await getActiveHelmRepository(repoName);

      if (!repo) {
        return undefined;
      }

      return HelmChartManager.forRepo(repo).getValues(chartName, version);
    };
  },

  causesSideEffects: true,
});

export default getHelmChartValuesInjectable;
