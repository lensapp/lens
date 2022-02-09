/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { HelmCharts } from "../+helm-charts";
import { HelmReleases } from "../+helm-releases";
import { helmChartsURL, helmChartsRoute, releaseURL, releaseRoute } from "../../../common/routes";

function getRouteTabs() {
  return computed((): TabLayoutRoute[] => [
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
  ]);
}

const helmRoutesInjectable = getInjectable({
  id: "helm-routes",
  instantiate: () => getRouteTabs(),
});

export default helmRoutesInjectable;
