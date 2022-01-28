/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-details.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { getMetricsForNamespace, IPodMetrics, Namespace } from "../../../common/k8s-api/endpoints";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Link } from "react-router-dom";
import { Spinner } from "../spinner";
import type { ResourceQuotaStore } from "../+resource-quotas/store";
import { KubeObjectMeta } from "../kube-object-meta";
import type { LimitRangeStore } from "../+limit-ranges/store";
import { ResourceMetrics } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+pods/charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import resourceQuotaStoreInjectable from "../+resource-quotas/store.injectable";
import limitRangeStoreInjectable from "../+limit-ranges/store.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface NamespaceDetailsProps extends KubeObjectDetailsProps<Namespace> {
}

interface Dependencies {
  resourceQuotaStore: ResourceQuotaStore;
  limitRangeStore: LimitRangeStore;
  isMetricHidden: boolean;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedNamespaceDetails = observer(({ kubeWatchApi, isMetricHidden, resourceQuotaStore, limitRangeStore, object: namespace }: Dependencies & NamespaceDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics>(null);

  if (!namespace) {
    return null;
  }

  if (!(namespace instanceof Namespace)) {
    logger.error("[NamespaceDetails]: passed object that is not an instanceof Namespace", namespace);

    return null;
  }

  useEffect(() => setMetrics(null), [namespace]);
  useEffect(() =>  kubeWatchApi.subscribeStores([
    resourceQuotaStore,
    limitRangeStore,
  ]), []);

  const loadMetrics = async () => {
    setMetrics(await getMetricsForNamespace(namespace.getName(), ""));
  };

  const quotas = resourceQuotaStore.getAllByNs(namespace.getName());
  const limitRanges = limitRangeStore.getAllByNs(namespace.getName());
  const status = namespace.getStatus();

  return (
    <div className="NamespaceDetails">
      {!isMetricHidden && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={namespace}
          metrics={metrics}
        >
          <PodCharts />
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={namespace}/>

      <DrawerItem name="Status">
        <span className={cssNames("status", status.toLowerCase())}>{status}</span>
      </DrawerItem>

      <DrawerItem name="Resource Quotas" className="quotas flex align-center">
        {resourceQuotaStore.isLoading && <Spinner/>}
        {quotas.map(quota => (
          <Link key={quota.getId()} to={getDetailsUrl(quota.selfLink)}>
            {quota.getName()}
          </Link>
        ))}
      </DrawerItem>
      <DrawerItem name="Limit Ranges">
        {limitRangeStore.isLoading && <Spinner/>}
        {limitRanges.map(limitRange => (
          <Link key={limitRange.getId()} to={getDetailsUrl(limitRange.selfLink)}>
            {limitRange.getName()}
          </Link>
        ))}
      </DrawerItem>
    </div>
  );
});

export const NamespaceDetails = withInjectables<Dependencies, NamespaceDetailsProps>(NonInjectedNamespaceDetails, {
  getProps: (di, props) => ({
    resourceQuotaStore: di.inject(resourceQuotaStoreInjectable),
    limitRangeStore: di.inject(limitRangeStoreInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.Namespace,
    }),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});
