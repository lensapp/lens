import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { HelmCharts, helmChartsRoute, helmChartsURL } from "../+apps-helm-charts";
import { HelmReleases, releaseRoute, releaseURL } from "../+apps-releases";
import { namespaceStore } from "../+namespaces/namespace.store";

@observer
export class Apps extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
    const query = namespaceStore.getContextParams();
    return [
      {
        title: <Trans>Charts</Trans>,
        component: HelmCharts,
        url: helmChartsURL(),
        routePath: helmChartsRoute.path.toString(),
      },
      {
        title: <Trans>Releases</Trans>,
        component: HelmReleases,
        url: releaseURL({ query }),
        routePath: releaseRoute.path.toString(),
      },
    ]
  }

  render() {
    return (
      <TabLayout className="Apps" tabs={Apps.tabRoutes}/>
    )
  }
}
