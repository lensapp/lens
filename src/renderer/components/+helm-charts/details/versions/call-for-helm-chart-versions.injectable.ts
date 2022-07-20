/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmChart } from "../../../../../renderer/k8s/helm-chart";
import getHelmChartDetailsInjectable from "../../../../k8s/helm-charts.api/get-details.injectable";

export type CallForHelmChartVersions = (
  repo: string,
  name: string
) => Promise<HelmChart[]>;

const callForHelmChartVersionsInjectable = getInjectable({
  id: "call-for-helm-chart-versions",

  instantiate: (di): CallForHelmChartVersions => {
    const getHelmChartDetails = di.inject(getHelmChartDetailsInjectable);

    return async (repository, name) => {
      // TODO: Dismantle wrong abstraction
      const details = await getHelmChartDetails(repository, name);

      return details.versions;
    };
  },

  causesSideEffects: true,
});

export default callForHelmChartVersionsInjectable;
