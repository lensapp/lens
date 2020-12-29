import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { HelmCharts, helmChartsRoute, helmChartsURL } from "../+apps-helm-charts";
import { HelmReleases, releaseRoute, releaseURL } from "../+apps-releases";
import { namespaceUrlParam } from "../+namespaces/namespace.store";

@observer
export class Apps extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
    const query = namespaceUrlParam.toObjectParam();

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
        url: releaseURL({ query }),
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
