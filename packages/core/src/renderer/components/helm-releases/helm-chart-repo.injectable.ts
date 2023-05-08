/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { when } from "mobx";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import helmChartVersionsInjectable from "../helm-charts/helm-charts/versions.injectable";

const helmChartRepoInjectable = getInjectable({
  id: "helm-chart-repo",
  instantiate: (di, release) => {
    const chartVersions = di.inject(helmChartVersionsInjectable, release);

    return asyncComputed({
      getValueFromObservedPromise: async () => {
        await when(() => !chartVersions.pending.get());

        const version = release.getVersion();

        return chartVersions.value
          .get()
          .find((chartVersion) => chartVersion.version === version)?.repo;
      },
    });
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, release: HelmRelease) => `${release.namespace}/${release.name}`,
  }),
});

export default helmChartRepoInjectable;
