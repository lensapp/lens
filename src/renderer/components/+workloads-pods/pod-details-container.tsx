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

import "./pod-details-container.scss";

import React from "react";
import type { IPodContainer, IPodContainerStatus, Pod } from "../../../common/k8s-api/endpoints";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { StatusBrick } from "../status-brick";
import { Badge } from "../badge";
import { ContainerEnvironment } from "./pod-container-env";
import { PodContainerPort } from "./pod-container-port";
import { ResourceMetrics } from "../resource-metrics";
import type { IMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { ContainerCharts } from "./container-charts";
import { LocaleDate } from "../locale-date";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { portForwardStore } from "../../port-forward/port-forward.store";
import { disposeOnUnmount, observer } from "mobx-react";

interface Props {
  pod: Pod;
  container: IPodContainer;
  metrics?: { [key: string]: IMetrics };
}

const hiddenPullPolicy = "IfNotPresent";

@observer
export class PodDetailsContainer extends React.Component<Props> {

  componentDidMount() {
    disposeOnUnmount(this, [
      portForwardStore.watch(),
    ]);
  }

  renderStatus(state: string, status: IPodContainerStatus) {
    if (!state || !status) {
      return null;
    }

    return (
      <DrawerItem name="Status">
        <span className={cssNames("status", state)}>
          {state}{status.ready ? `, ready` : ""}
          {state === "terminated" ? ` - ${status.state.terminated.reason} (exit code: ${status.state.terminated.exitCode})` : ""}
        </span>
      </DrawerItem>
    );
  }

  renderLastState(lastState: string, status: IPodContainerStatus) {
    if (lastState !== "terminated" || !status) {
      return null;
    }

    return (
      <DrawerItem name="Last Status">
        <span>
          {lastState}<br/>
          Reason: {status.lastState.terminated.reason} - exit code: {status.lastState.terminated.exitCode}<br/>
          Started at: {<LocaleDate date={status.lastState.terminated.startedAt} />}<br/>
          Finished at: {<LocaleDate date={status.lastState.terminated.finishedAt} />}<br/>
        </span>
      </DrawerItem>
    );
  }

  render() {
    const { pod, container, metrics } = this.props;

    if (!pod || !container) return null;
    const { name, image, imagePullPolicy = hiddenPullPolicy, ports = [], volumeMounts = [], command = [], args = [] } = container;
    const status = pod.getContainerStatuses().find(status => status.name === container.name);
    const state = status ? Object.keys(status.state)[0] : "";
    const lastState = status ? Object.keys(status.lastState)[0] : "";
    const ready = status ? status.ready : "";
    const imageId = status? status.imageID : "";
    const liveness = pod.getLivenessProbe(container);
    const readiness = pod.getReadinessProbe(container);
    const startup = pod.getStartupProbe(container);
    const isInitContainer = !!pod.getInitContainers().find(c => c.name == name);
    const metricTabs = [
      "CPU",
      "Memory",
      "Filesystem",
    ];
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Container);

    return (
      <div className="PodDetailsContainer">
        <div className="pod-container-title">
          <StatusBrick className={cssNames(state, { ready })}/>{name}
        </div>
        {!isMetricHidden && !isInitContainer && (
          <ResourceMetrics tabs={metricTabs} params={{ metrics }}>
            <ContainerCharts/>
          </ResourceMetrics>
        )}

        {this.renderStatus(state, status)}
        {this.renderLastState(lastState, status)}

        <DrawerItem name="Image">
          <Badge label={image} tooltip={imageId}/>
        </DrawerItem>

        <DrawerItem name="ImagePullPolicy" hidden={imagePullPolicy === hiddenPullPolicy}>
          {imagePullPolicy}
        </DrawerItem>

        <DrawerItem name="Ports" hidden={ports.length === 0}>
          {
            ports.map((port) => (
              <PodContainerPort
                pod={pod}
                port={port}
                key={`${container.name}-port-${port.containerPort}-${port.protocol}`}
              />
            ))
          }
        </DrawerItem>

        <ContainerEnvironment container={container} namespace={pod.getNs()}/>

        <DrawerItem name="Mounts" hidden={volumeMounts.length === 0}>
          {
            volumeMounts.map(({ name, mountPath, readOnly }) => (
              <React.Fragment key={name + mountPath}>
                <span className="mount-path">{mountPath}</span>
                <span className="mount-from">from {name} ({readOnly ? "ro" : "rw"})</span>
              </React.Fragment>
            ))
          }
        </DrawerItem>

        <DrawerItem name="Liveness" labelsOnly hidden={liveness.length === 0}>
          {
            liveness.map((value, index) => <Badge key={index} label={value}/>)
          }
        </DrawerItem>

        <DrawerItem name="Readiness" labelsOnly hidden={readiness.length === 0}>
          {
            readiness.map((value, index) => <Badge key={index} label={value}/>)
          }
        </DrawerItem>

        <DrawerItem name="Startup" labelsOnly hidden={startup.length === 0}>
          {
            startup.map((value, index) => <Badge key={index} label={value}/>)
          }
        </DrawerItem>

        <DrawerItem name="Command" hidden={command.length === 0}>
          <ul className="argument-list">
            {
              command.map((cmd, index) => <li key={index}>{cmd}</li>)
            }
          </ul>
        </DrawerItem>

        <DrawerItem name="Arguments" hidden={args.length === 0}>
          <ul className="argument-list">
            {
              args.map((arg, index) => <li key={index}>{arg}</li>)
            }
          </ul>
        </DrawerItem>
      </div>
    );
  }
}
