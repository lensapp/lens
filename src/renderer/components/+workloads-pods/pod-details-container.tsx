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
import type { IPodContainer, IPodContainerStatus, Pod } from "../../api/endpoints";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { StatusBrick } from "../status-brick";
import { Badge } from "../badge";
import { ContainerEnvironment } from "./pod-container-env";
import { PodContainerPort } from "./pod-container-port";
import { ResourceMetrics } from "../resource-metrics";
import type { IMetrics } from "../../api/endpoints/metrics.api";
import { ContainerCharts } from "./container-charts";
import { LocaleDate } from "../locale-date";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../main/cluster";

interface Props {
  pod: Pod;
  container: IPodContainer;
  metrics?: { [key: string]: IMetrics };
}

export class PodDetailsContainer extends React.Component<Props> {

  renderStatus(state: string, status: IPodContainerStatus) {
    const ready = status ? status.ready : "";

    return (
      <span className={cssNames("status", state)}>
        {state}{ready ? `, ready` : ""}
        {state === "terminated" ? ` - ${status.state.terminated.reason} (exit code: ${status.state.terminated.exitCode})` : ""}
      </span>
    );
  }

  renderLastState(lastState: string, status: IPodContainerStatus) {
    if (lastState === "terminated") {
      return (
        <span>
          {lastState}<br/>
          Reason: {status.lastState.terminated.reason} - exit code: {status.lastState.terminated.exitCode}<br/>
          Started at: {<LocaleDate date={status.lastState.terminated.startedAt} />}<br/>
          Finished at: {<LocaleDate date={status.lastState.terminated.finishedAt} />}<br/>
        </span>
      );
    }

    return null;
  }

  render() {
    const { pod, container, metrics } = this.props;

    if (!pod || !container) return null;
    const { name, image, imagePullPolicy, ports, volumeMounts, command, args } = container;
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
        {!isMetricHidden && !isInitContainer &&
        <ResourceMetrics tabs={metricTabs} params={{ metrics }}>
          <ContainerCharts/>
        </ResourceMetrics>
        }
        {status &&
        <DrawerItem name="Status">
          {this.renderStatus(state, status)}
        </DrawerItem>
        }
        {lastState &&
        <DrawerItem name="Last Status">
          {this.renderLastState(lastState, status)}
        </DrawerItem>
        }
        <DrawerItem name="Image">
          <Badge label={image} tooltip={imageId}/>
        </DrawerItem>
        {imagePullPolicy && imagePullPolicy !== "IfNotPresent" &&
        <DrawerItem name="ImagePullPolicy">
          {imagePullPolicy}
        </DrawerItem>
        }
        {ports && ports.length > 0 &&
        <DrawerItem name="Ports">
          {
            ports.map((port) => {
              const key = `${container.name}-port-${port.containerPort}-${port.protocol}`;

              return (
                <PodContainerPort pod={pod} port={port} key={key}/>
              );
            })
          }
        </DrawerItem>
        }
        {<ContainerEnvironment container={container} namespace={pod.getNs()}/>}
        {volumeMounts && volumeMounts.length > 0 &&
        <DrawerItem name="Mounts">
          {
            volumeMounts.map(mount => {
              const { name, mountPath, readOnly } = mount;

              return (
                <React.Fragment key={name + mountPath}>
                  <span className="mount-path">{mountPath}</span>
                  <span className="mount-from">from {name} ({readOnly ? "ro" : "rw"})</span>
                </React.Fragment>
              );
            })
          }
        </DrawerItem>
        }
        {liveness.length > 0 &&
        <DrawerItem name="Liveness" labelsOnly>
          {
            liveness.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
        }
        {readiness.length > 0 &&
        <DrawerItem name="Readiness" labelsOnly>
          {
            readiness.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
        }
        {startup.length > 0 &&
        <DrawerItem name="Startup" labelsOnly>
          {
            startup.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
        }
        {command &&
        <DrawerItem name="Command">
          {command.join(" ")}
        </DrawerItem>
        }

        {args &&
        <DrawerItem name="Arguments">
          {args.join(" ")}
        </DrawerItem>
        }
      </div>
    );
  }
}
