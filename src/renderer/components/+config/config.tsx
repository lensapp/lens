/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { ConfigMaps } from "../+config-maps";
import { Secrets } from "../+config-secrets";
import { namespaceUrlParam } from "../+namespaces/namespace.store";
import { ResourceQuotas } from "../+config-resource-quotas";
import { PodDisruptionBudgets } from "../+config-pod-disruption-budgets";
import { HorizontalPodAutoscalers } from "../+config-autoscalers";
import { LimitRanges } from "../+config-limit-ranges";
import * as routes from "../../../common/routes";
import type { Cluster } from "../../../main/cluster";

@observer
export class Config extends React.Component<{ cluster: Cluster }> {
  static tabRoutes(cluster: Cluster): TabLayoutRoute[] {
    const query = namespaceUrlParam.toObjectParam();
    const tabs: TabLayoutRoute[] = [];

    if (cluster.isAllowedResource("configmaps")) {
      tabs.push({
        title: "ConfigMaps",
        component: ConfigMaps,
        url: routes.configMapsURL({ query }),
        routePath: routes.configMapsRoute.path.toString(),
      });
    }

    if (cluster.isAllowedResource("secrets")) {
      tabs.push({
        title: "Secrets",
        component: Secrets,
        url: routes.secretsURL({ query }),
        routePath: routes.secretsRoute.path.toString(),
      });
    }

    if (cluster.isAllowedResource("resourcequotas")) {
      tabs.push({
        title: "Resource Quotas",
        component: ResourceQuotas,
        url: routes.resourceQuotaURL({ query }),
        routePath: routes.resourceQuotaRoute.path.toString(),
      });
    }

    if (cluster.isAllowedResource("limitranges")) {
      tabs.push({
        title: "Limit Ranges",
        component: LimitRanges,
        url: routes.limitRangeURL({ query }),
        routePath: routes.limitRangesRoute.path.toString(),
      });
    }

    if (cluster.isAllowedResource("horizontalpodautoscalers")) {
      tabs.push({
        title: "HPA",
        component: HorizontalPodAutoscalers,
        url: routes.hpaURL({ query }),
        routePath: routes.hpaRoute.path.toString(),
      });
    }

    if (cluster.isAllowedResource("poddisruptionbudgets")) {
      tabs.push({
        title: "Pod Disruption Budgets",
        component: PodDisruptionBudgets,
        url: routes.pdbURL({ query }),
        routePath: routes.pdbRoute.path.toString(),
      });
    }

    return tabs;
  }

  render() {
    return (
      <TabLayout className="Config" tabs={Config.tabRoutes(this.props.cluster)}/>
    );
  }
}
