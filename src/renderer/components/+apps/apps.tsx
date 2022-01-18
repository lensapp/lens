/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { HelmCharts } from "../+apps-helm-charts";
import { HelmReleases } from "../+apps-releases";
import { helmChartsURL, helmChartsRoute, releaseURL, releaseRoute } from "../../../common/routes";

@observer
export class Apps extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {

    return [
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
    ];
  }

  render() {
    return (
      <TabLayout className="Apps" tabs={Apps.tabRoutes}/>
    );
  }
}
