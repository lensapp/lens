/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details-container.scss";

import React from "react";
import type { PodContainer, PodContainerStatus, Pod } from "../../../common/k8s-api/endpoints";
import { DrawerItem } from "../drawer";
import { cssNames, isDefined } from "../../utils";
import { StatusBrick } from "../status-brick";
import { Badge } from "../badge";
import { ContainerEnvironment } from "./pod-container-env";
import { PodContainerPort } from "./pod-container-port";
import { ResourceMetrics } from "../resource-metrics";
import type { MetricData } from "../../../common/k8s-api/endpoints/metrics.api";
import { ContainerCharts } from "./container-charts";
import { LocaleDate } from "../locale-date";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { PortForwardStore } from "../../port-forward";
import { disposeOnUnmount, observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/port-forward-store/port-forward-store.injectable";
import type { GetActiveClusterEntity } from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import getActiveClusterEntityInjectable from "../../api/catalog/entity/get-active-cluster-entity.injectable";

export interface PodDetailsContainerProps {
  pod: Pod;
  container: PodContainer;
  metrics?: Partial<Record<string, MetricData>>;
}

interface Dependencies {
  portForwardStore: PortForwardStore;
  getActiveClusterEntity: GetActiveClusterEntity;
}

@observer
class NonInjectedPodDetailsContainer extends React.Component<PodDetailsContainerProps & Dependencies> {

  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.portForwardStore.watch(),
    ]);
  }

  renderStatus(state: string, status: PodContainerStatus | null | undefined) {
    const { ready = false, state: containerState = {}} = status ?? {};
    const { terminated } = containerState;

    return (
      <span className={cssNames("status", state)}>
        {state}
        {ready ? ", ready" : ""}
        {terminated ? ` - ${terminated.reason} (exit code: ${terminated.exitCode})` : ""}
      </span>
    );
  }

  renderLastState(lastState: string, status: PodContainerStatus | null | undefined) {
    const { lastState: lastContainerState = {}} = status ?? {};
    const { terminated } = lastContainerState;

    if (lastState === "terminated" && terminated) {
      return (
        <span>
          {lastState}
          <br/>
          Reason:
          {`Reason: ${terminated.reason} - exit code: ${terminated.exitCode}`}
          <br/>
          {"Started at: "}
          {<LocaleDate date={terminated.startedAt} />}
          <br/>
          {"Finished at: "}
          {<LocaleDate date={terminated.finishedAt} />}
          <br/>
        </span>
      );
    }

    return null;
  }

  render() {
    const { pod, container, metrics, getActiveClusterEntity } = this.props;

    if (!pod || !container) return null;
    const { name, image, imagePullPolicy, ports, volumeMounts, command, args } = container;
    const status = pod.getContainerStatuses().find(status => status.name === container.name);
    const state = status ? Object.keys(status?.state ?? {})[0] : "";
    const lastState = status ? Object.keys(status?.lastState ?? {})[0] : "";
    const ready = status ? status.ready : "";
    const imageId = status? status.imageID : "";
    const liveness = pod.getLivenessProbe(container);
    const readiness = pod.getReadinessProbe(container);
    const startup = pod.getStartupProbe(container);
    const isInitContainer = !!pod.getInitContainers().find(c => c.name == name);
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Container);

    return (
      <div className="PodDetailsContainer">
        <div className="pod-container-title">
          <StatusBrick className={cssNames(state, { ready })}/>
          {name}
        </div>
        {!isMetricHidden && !isInitContainer && (
          <ResourceMetrics
            object={pod}
            tabs={[
              "CPU",
              "Memory",
              "Filesystem",
            ]}
            metrics={metrics}
          >
            <ContainerCharts/>
          </ResourceMetrics>
        )}
        {status && (
          <DrawerItem name="Status">
            {this.renderStatus(state, status)}
          </DrawerItem>
        )}
        {lastState && (
          <DrawerItem name="Last Status">
            {this.renderLastState(lastState, status)}
          </DrawerItem>
        )}
        <DrawerItem name="Image">
          <Badge label={image} tooltip={imageId}/>
        </DrawerItem>
        {imagePullPolicy && imagePullPolicy !== "IfNotPresent" && (
          <DrawerItem name="ImagePullPolicy">
            {imagePullPolicy}
          </DrawerItem>
        )}
        {ports && ports.length > 0 && (
          <DrawerItem name="Ports">
            {
              ports
                .filter(isDefined)
                .map((port) => (
                  <PodContainerPort
                    pod={pod}
                    port={port}
                    key={`${container.name}-port-${port.containerPort}-${port.protocol}`}
                  />
                ))
            }
          </DrawerItem>
        )}
        {<ContainerEnvironment container={container} namespace={pod.getNs()}/>}
        {volumeMounts && volumeMounts.length > 0 && (
          <DrawerItem name="Mounts">
            {
              volumeMounts.map(mount => {
                const { name, mountPath, readOnly } = mount;

                return (
                  <React.Fragment key={name + mountPath}>
                    <span className="mount-path">{mountPath}</span>
                    <span className="mount-from">
                      {`from ${name} (${readOnly ? "ro" : "rw"})`}
                    </span>
                  </React.Fragment>
                );
              })
            }
          </DrawerItem>
        )}
        {liveness.length > 0 && (
          <DrawerItem name="Liveness" labelsOnly>
            {
              liveness.map((value, index) => (
                <Badge key={index} label={value}/>
              ))
            }
          </DrawerItem>
        )}
        {readiness.length > 0 && (
          <DrawerItem name="Readiness" labelsOnly>
            {
              readiness.map((value, index) => (
                <Badge key={index} label={value}/>
              ))
            }
          </DrawerItem>
        )}
        {startup.length > 0 && (
          <DrawerItem name="Startup" labelsOnly>
            {
              startup.map((value, index) => (
                <Badge key={index} label={value}/>
              ))
            }
          </DrawerItem>
        )}
        {command && (
          <DrawerItem name="Command">
            {command.join(" ")}
          </DrawerItem>
        )}

        {args && (
          <DrawerItem name="Arguments">
            {args.join(" ")}
          </DrawerItem>
        )}
      </div>
    );
  }
}

export const PodDetailsContainer = withInjectables<Dependencies, PodDetailsContainerProps>(NonInjectedPodDetailsContainer, {
  getProps: (di, props) => ({
    ...props,
    portForwardStore: di.inject(portForwardStoreInjectable),
    getActiveClusterEntity: di.inject(getActiveClusterEntityInjectable),
  }),
});
