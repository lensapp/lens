/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { HelmCharts } from "../+helm-charts";
import { HelmReleases } from "../+helm-releases";
import { helmChartsURL, helmChartsRoute, releaseURL, releaseRoute } from "../../../common/routes";
import type { TabLayoutRoute } from "../layout/tab-layout";

const helmAppRoutesInjectable = getInjectable({
  instantiate: () => computed(() => [
    {
      title: "Charts",
      component: HelmCharts,
      url: helmChartsURL(),
      routePath: helmChartsRoute.path.toString(),
    },
    {
      title: "Releases",
      component: HelmReleases,
      url: releaseURL(),
      routePath: releaseRoute.path.toString(),
    },
  ] as TabLayoutRoute[]),
  lifecycle: lifecycleEnum.singleton,
});

export default helmAppRoutesInjectable;
