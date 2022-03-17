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
import type { PodMetricData } from "../../../common/k8s-api/endpoints";
import { nodeApi, Pod, getMetricsForPods } from "../../../common/k8s-api/endpoints";
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
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { PodVolumes } from "./details/volumes/view";

export interface PodDetailsProps extends KubeObjectDetailsProps<Pod> {
}

@observer
export class PodDetails extends React.Component<PodDetailsProps> {
  @observable metrics: PodMetricData | null = null;
  @observable containerMetrics: PodMetricData | null = null;

  constructor(props: PodDetailsProps) {
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
    const { object: pod } = this.props;

    this.metrics = await getMetricsForPods([pod], pod.getNs());
    this.containerMetrics = await getMetricsForPods([pod], pod.getNs(), "container, namespace");
  };

  render() {
    const { object: pod } = this.props;

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
        <DrawerItem name="Priority Class">
          {pod.getPriorityClassName()}
        </DrawerItem>
        <DrawerItem name="QoS Class">
          {pod.getQosClass()}
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
