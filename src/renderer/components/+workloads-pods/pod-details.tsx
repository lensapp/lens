/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { observable, reaction, makeObservable } from "mobx";
import type { NodeApi } from "../../../common/k8s-api/endpoints";
import { Pod } from "../../../common/k8s-api/endpoints";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { cssNames, toJS } from "../../utils";
import { PodDetailsContainer } from "./pod-details-container";
import { PodDetailsAffinities } from "./pod-details-affinities";
import { PodDetailsTolerations } from "./pod-details-tolerations";
import { PodDetailsSecrets } from "./pod-details-secrets";
import { ResourceMetrics } from "../resource-metrics";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getItemMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { PodCharts, podMetricTabs } from "./pod-charts";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import logger from "../../../common/logger";
import { PodVolumes } from "./details/volumes/view";
import type { PodMetricData, RequestPodMetrics } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import requestPodMetricsInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics.injectable";
import type { GetActiveClusterEntity } from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import getActiveClusterEntityInjectable from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import nodeApiInjectable from "../../../common/k8s-api/endpoints/node.api.injectable";

export interface PodDetailsProps extends KubeObjectDetailsProps<Pod> {
}

interface Dependencies {
  requestPodMetrics: RequestPodMetrics;
  getActiveClusterEntity: GetActiveClusterEntity;
  getDetailsUrl: GetDetailsUrl;
  nodeApi: NodeApi;
}

@observer
class NonInjectedPodDetails extends React.Component<PodDetailsProps & Dependencies> {
  @observable metrics: PodMetricData | null = null;
  @observable containerMetrics: PodMetricData | null = null;

  constructor(props: PodDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
        this.containerMetrics = null;
      }),
    ]);
  }

  loadMetrics = async () => {
    const { object: pod, requestPodMetrics } = this.props;

    this.metrics = await requestPodMetrics([pod], pod.getNs());
    this.containerMetrics = await requestPodMetrics([pod], pod.getNs(), "container, namespace");
  };

  render() {
    const { object: pod, getActiveClusterEntity, getDetailsUrl, nodeApi } = this.props;

    if (!pod) {
      return null;
    }

    if (!(pod instanceof Pod)) {
      logger.error("[PodDetails]: passed object that is not an instanceof Pod", pod);

      return null;
    }

    const { status, spec } = pod;
    const { conditions = [], podIP } = status ?? {};
    const podIPs = pod.getIPs();
    const { nodeName } = spec ?? {};
    const nodeSelector = pod.getNodeSelectors();
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Pod);
    const initContainers = pod.getInitContainers();
    const containers = pod.getContainers();

    return (
      <div className="PodDetails">
        {!isMetricHidden && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs}
            object={pod}
            metrics={this.metrics}
          >
            <PodCharts />
          </ResourceMetrics>
        )}

        <KubeObjectMeta object={pod} />

        <DrawerItem name="Status">
          <span className={cssNames("status", kebabCase(pod.getStatusMessage()))}>
            {pod.getStatusMessage()}
          </span>
        </DrawerItem>
        <DrawerItem name="Node" hidden={!nodeName}>
          <Link to={getDetailsUrl(nodeApi.getUrl({ name: nodeName }))}>
            {nodeName}
          </Link>
        </DrawerItem>
        <DrawerItem name="Pod IP">
          {podIP}
        </DrawerItem>
        <DrawerItem
          name="Pod IPs"
          hidden={podIPs.length === 0}
          labelsOnly
        >
          {podIPs.map(label => <Badge key={label} label={label} />)}
        </DrawerItem>
        <DrawerItem name="Service Account">
          {pod.getServiceAccountName()}
        </DrawerItem>
        <DrawerItem name="Priority Class" hidden={pod.getPriorityClassName() === ""}>
          {pod.getPriorityClassName()}
        </DrawerItem>
        <DrawerItem name="QoS Class">
          {pod.getQosClass()}
        </DrawerItem>
        <DrawerItem name="Runtime Class" hidden={pod.getRuntimeClassName() === ""}>
          {pod.getRuntimeClassName()}
        </DrawerItem>

        <DrawerItem
          name="Conditions"
          className="conditions"
          hidden={conditions.length === 0}
          labelsOnly
        >
          {
            conditions.map(({ type, status, lastTransitionTime }) => (
              <Badge
                key={type}
                label={type}
                disabled={status === "False"}
                tooltip={`Last transition time: ${lastTransitionTime}`}
              />
            ))
          }
        </DrawerItem>

        <DrawerItem name="Node Selector" hidden={nodeSelector.length === 0}>
          {nodeSelector.map(label => <Badge key={label} label={label} />)}
        </DrawerItem>

        <PodDetailsTolerations workload={pod} />
        <PodDetailsAffinities workload={pod} />

        <DrawerItem name="Secrets" hidden={pod.getSecrets().length === 0}>
          <PodDetailsSecrets pod={pod} />
        </DrawerItem>

        {initContainers.length > 0 && (
          <>
            <DrawerTitle>Init Containers</DrawerTitle>
            {initContainers.map(container => (
              <PodDetailsContainer
                key={container.name}
                pod={pod}
                container={container}
              />
            ))}
          </>
        )}

        <DrawerTitle>Containers</DrawerTitle>
        {containers.map(container => (
          <PodDetailsContainer
            key={container.name}
            pod={pod}
            container={container}
            metrics={getItemMetrics(toJS(this.containerMetrics), container.name)}
          />
        ))}

        <PodVolumes pod={pod} />
      </div>
    );
  }
}

export const PodDetails = withInjectables<Dependencies, PodDetailsProps>(NonInjectedPodDetails, {
  getProps: (di, props) => ({
    ...props,
    requestPodMetrics: di.inject(requestPodMetricsInjectable),
    getActiveClusterEntity: di.inject(getActiveClusterEntityInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    nodeApi: di.inject(nodeApiInjectable),
  }),
});
