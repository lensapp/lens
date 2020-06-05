import React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { Trans } from "@lingui/macro";
import { MainLayout, TabRoute } from "../layout/main-layout";
import { ConfigMaps, configMapsRoute, configMapsURL } from "../+config-maps";
import { Secrets, secretsRoute, secretsURL } from "../+config-secrets";
import { namespaceStore } from "../+namespaces/namespace.store";
import { resourceQuotaRoute, ResourceQuotas, resourceQuotaURL } from "../+config-resource-quotas";
import { configURL } from "./config.route";
import { HorizontalPodAutoscalers, hpaRoute, hpaURL } from "../+config-autoscalers";
import { buildURL } from "../../navigation";
import { isAllowedResource } from "../../api/rbac"

export const certificatesURL = buildURL("/certificates");
export const issuersURL = buildURL("/issuers");
export const clusterIssuersURL = buildURL("/clusterissuers");

@observer
export class Config extends React.Component {
  static get tabRoutes(): TabRoute[] {
    const query = namespaceStore.getContextParams()
    const routes: TabRoute[] = []
    if (isAllowedResource("configmaps")) {
      routes.push({
        title: <Trans>ConfigMaps</Trans>,
        component: ConfigMaps,
        url: configMapsURL({ query }),
        path: configMapsRoute.path,
      })
    }
    if (isAllowedResource("secrets")) {
      routes.push({
        title: <Trans>Secrets</Trans>,
        component: Secrets,
        url: secretsURL({ query }),
        path: secretsRoute.path,
      })
    }
    if (isAllowedResource("resourcequotas")) {
      routes.push({
        title: <Trans>Resource Quotas</Trans>,
        component: ResourceQuotas,
        url: resourceQuotaURL({ query }),
        path: resourceQuotaRoute.path,
      })
    }
    if (isAllowedResource("horizontalpodautoscalers")) {
      routes.push({
        title: <Trans>HPA</Trans>,
        component: HorizontalPodAutoscalers,
        url: hpaURL({ query }),
        path: hpaRoute.path,
      })
    }
    return routes;
  }

  render() {
    const tabRoutes = Config.tabRoutes;
    return (
      <MainLayout className="Config" tabs={tabRoutes}>
        <Switch>
          {tabRoutes.map((route, index) => <Route key={index} {...route}/>)}
          <Redirect to={configURL({ query: namespaceStore.getContextParams() })}/>
        </Switch>
      </MainLayout>
    )
  }
}
