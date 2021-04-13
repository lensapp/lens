import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { ConfigMaps, configMapsRoute, configMapsURL } from "../+config-maps";
import { Secrets, secretsRoute, secretsURL } from "../+config-secrets";
import { namespaceUrlParam } from "../+namespaces/namespace.store";
import { resourceQuotaRoute, ResourceQuotas, resourceQuotaURL } from "../+config-resource-quotas";
import { pdbRoute, pdbURL, PodDisruptionBudgets } from "../+config-pod-disruption-budgets";
import { HorizontalPodAutoscalers, hpaRoute, hpaURL } from "../+config-autoscalers";
import { isAllowedResource } from "../../../common/rbac";
import { LimitRanges, limitRangesRoute, limitRangeURL } from "../+config-limit-ranges";

@observer
export class Config extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
    const query = namespaceUrlParam.toObjectParam();
    const routes: TabLayoutRoute[] = [];

    if (isAllowedResource("configmaps")) {
      routes.push({
        title: "ConfigMaps",
        component: ConfigMaps,
        url: configMapsURL({ query }),
        routePath: configMapsRoute.path.toString(),
      });
    }

    if (isAllowedResource("secrets")) {
      routes.push({
        title: "Secrets",
        component: Secrets,
        url: secretsURL({ query }),
        routePath: secretsRoute.path.toString(),
      });
    }

    if (isAllowedResource("resourcequotas")) {
      routes.push({
        title: "Resource Quotas",
        component: ResourceQuotas,
        url: resourceQuotaURL({ query }),
        routePath: resourceQuotaRoute.path.toString(),
      });
    }

    if (isAllowedResource("limitranges")) {
      routes.push({
        title: "Limit Ranges",
        component: LimitRanges,
        url: limitRangeURL({ query }),
        routePath: limitRangesRoute.path.toString(),
      });
    }

    if (isAllowedResource("horizontalpodautoscalers")) {
      routes.push({
        title: "HPA",
        component: HorizontalPodAutoscalers,
        url: hpaURL({ query }),
        routePath: hpaRoute.path.toString(),
      });
    }

    if (isAllowedResource("poddisruptionbudgets")) {
      routes.push({
        title: "Pod Disruption Budgets",
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
