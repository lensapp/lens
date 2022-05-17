/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-details.scss";

import React from "react";
import { computed, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { getMetricsForNamespace, type PodMetricData, Namespace } from "../../../common/k8s-api/endpoints";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Link } from "react-router-dom";
import { Spinner } from "../spinner";
import { KubeObjectMeta } from "../kube-object-meta";
import { ResourceMetrics } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";

import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { GetActiveClusterEntity } from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import type { ResourceQuotaStore } from "../+config-resource-quotas/store";
import type { LimitRangeStore } from "../+config-limit-ranges/store";
import getActiveClusterEntityInjectable from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import limitRangeStoreInjectable from "../+config-limit-ranges/store.injectable";
import resourceQuotaStoreInjectable from "../+config-resource-quotas/store.injectable";

export interface NamespaceDetailsProps extends KubeObjectDetailsProps<Namespace> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  getActiveClusterEntity: GetActiveClusterEntity;
  getDetailsUrl: GetDetailsUrl;
  resourceQuotaStore: ResourceQuotaStore;
  limitRangeStore: LimitRangeStore;
}

@observer
class NonInjectedNamespaceDetails extends React.Component<NamespaceDetailsProps & Dependencies> {
  @observable metrics: PodMetricData | null = null;

  constructor(props: NamespaceDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),

      this.props.subscribeStores([
        this.props.resourceQuotaStore,
        this.props.limitRangeStore,
      ]),
    ]);
  }

  @computed get quotas() {
    const namespace = this.props.object.getName();

    return this.props.resourceQuotaStore.getAllByNs(namespace);
  }

  @computed get limitranges() {
    const namespace = this.props.object.getName();

    return this.props.limitRangeStore.getAllByNs(namespace);
  }

  loadMetrics = async () => {
    this.metrics = await getMetricsForNamespace(this.props.object.getName(), "");
  };

  render() {
    const { object: namespace, getActiveClusterEntity, resourceQuotaStore, getDetailsUrl, limitRangeStore } = this.props;

    if (!namespace) {
      return null;
    }

    if (!(namespace instanceof Namespace)) {
      logger.error("[NamespaceDetails]: passed object that is not an instanceof Namespace", namespace);

      return null;
    }

    const status = namespace.getStatus();
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Namespace);

    return (
      <div className="NamespaceDetails">
        {!isMetricHidden && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs}
            object={namespace}
            metrics={this.metrics}
          >
            <PodCharts />
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={namespace}/>

        <DrawerItem name="Status">
          <span className={cssNames("status", status.toLowerCase())}>{status}</span>
        </DrawerItem>

        <DrawerItem name="Resource Quotas" className="quotas flex align-center">
          {!this.quotas && resourceQuotaStore.isLoading && <Spinner/>}
          {this.quotas.map(quota => quota.selfLink && (
            <Link key={quota.getId()} to={getDetailsUrl(quota.selfLink)}>
              {quota.getName()}
            </Link>
          ))}
        </DrawerItem>
        <DrawerItem name="Limit Ranges">
          {!this.limitranges && limitRangeStore.isLoading && <Spinner/>}
          {this.limitranges.map(limitrange => limitrange.selfLink && (
            <Link key={limitrange.getId()} to={getDetailsUrl(limitrange.selfLink)}>
              {limitrange.getName()}
            </Link>
          ))}
        </DrawerItem>
      </div>
    );
  }
}

export const NamespaceDetails = withInjectables<Dependencies, NamespaceDetailsProps>(NonInjectedNamespaceDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    getActiveClusterEntity: di.inject(getActiveClusterEntityInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    limitRangeStore: di.inject(limitRangeStoreInjectable),
    resourceQuotaStore: di.inject(resourceQuotaStoreInjectable),
  }),
});

