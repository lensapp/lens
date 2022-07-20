/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getHelmChartDetailsInjectable from "../../../../k8s/helm-charts.api/get-details.injectable";

export type CallForHelmChartReadme = (
  repo: string,
  name: string,
  version: string,
) => Promise<string>;

const callForHelmChartReadmeInjectable = getInjectable({
  id: "call-for-helm-chart-readme",
  instantiate: (di): CallForHelmChartReadme => {
    const getHelmChartDetails = di.inject(getHelmChartDetailsInjectable);

    return async (repository, name, version) => {
      // TODO: Dismantle wrong abstraction
      const details = await getHelmChartDetails(repository, name, { version });

      return details.readme;
    };
  },
  causesSideEffects: true,
});

export default callForHelmChartReadmeInjectable;
