/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmChart } from "../../../../../common/k8s-api/endpoints/helm-charts.api";
import { getChartDetails } from "../../../../../common/k8s-api/endpoints/helm-charts.api";

export type CallForHelmChartVersions = (
  repo: string,
  name: string
) => Promise<HelmChart[]>;

const callForHelmChartVersionsInjectable = getInjectable({
  id: "call-for-helm-chart-versions",

  instantiate:
    (): CallForHelmChartVersions => async (repository: string, name: string) => {
    // TODO: Dismantle wrong abstraction
      const details = await getChartDetails(repository, name);

      return details.versions;
    },

  causesSideEffects: true,
});

export default callForHelmChartVersionsInjectable;
