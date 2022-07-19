/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getChartDetails } from "../../../../../common/k8s-api/endpoints/helm-charts.api";

export type CallForHelmChartReadme = (
  repo: string,
  name: string,
  version: string,
) => Promise<string>;

const callForHelmChartReadmeInjectable = getInjectable({
  id: "call-for-helm-chart-readme",

  instantiate:
    (): CallForHelmChartReadme =>
      async (repository: string, name: string, version: string) => {
        // TODO: Dismantle wrong abstraction
        const details = await getChartDetails(repository, name, { version });

        return details.readme;
      },

  causesSideEffects: true,
});

export default callForHelmChartReadmeInjectable;
