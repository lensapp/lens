import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { ConfigMaps, configMapsRoute, configMapsURL } from "../+config-maps";
import { Secrets, secretsRoute, secretsURL } from "../+config-secrets";
import { namespaceStore } from "../+namespaces/namespace.store";
import { resourceQuotaRoute, ResourceQuotas, resourceQuotaURL } from "../+config-resource-quotas";
import { pdbRoute, pdbURL, PodDisruptionBudgets } from "../+config-pod-disruption-budgets";
import { HorizontalPodAutoscalers, hpaRoute, hpaURL } from "../+config-autoscalers";
import { isAllowedResource } from "../../../common/rbac";

@observer
export class Config extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
    const query = namespaceStore.getContextParams();
    const routes: TabLayoutRoute[] = [];
    if (isAllowedResource("configmaps")) {
      routes.push({
        title: <Trans>ConfigMaps</Trans>,
        component: ConfigMaps,
        url: configMapsURL({ query }),
        routePath: configMapsRoute.path.toString(),
      });
    }
    if (isAllowedResource("secrets")) {
      routes.push({
        title: <Trans>Secrets</Trans>,
        component: Secrets,
        url: secretsURL({ query }),
        routePath: secretsRoute.path.toString(),
      });
    }
    if (isAllowedResource("resourcequotas")) {
      routes.push({
        title: <Trans>Resource Quotas</Trans>,
        component: ResourceQuotas,
        url: resourceQuotaURL({ query }),
        routePath: resourceQuotaRoute.path.toString(),
      });
    }
    if (isAllowedResource("horizontalpodautoscalers")) {
      routes.push({
        title: <Trans>HPA</Trans>,
        component: HorizontalPodAutoscalers,
        url: hpaURL({ query }),
        routePath: hpaRoute.path.toString(),
      });
    }
    if (isAllowedResource("poddisruptionbudgets")) {
      routes.push({
        title: <Trans>Pod Disruption Budgets</Trans>,
        component: PodDisruptionBudgets,
        url: pdbURL({ query }),
        routePath: pdbRoute.path.toString(),
      });
    }
    return routes;
  }

  render() {
    return (
      <TabLayout className="Config" tabs={Config.tabRoutes}/>
    );
  }
}
