/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details-container.scss";

import React, { useEffect } from "react";
import { IPodContainer, IPodContainerStatus, Pod } from "../../../common/k8s-api/endpoints";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { StatusBrick } from "../status-brick";
import { Badge } from "../badge";
import { ContainerEnvironment } from "./container-env";
import { ResourceMetrics } from "../resource-metrics";
import type { IMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { ContainerCharts } from "./container-charts";
import { LocaleDate } from "../locale-date";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import watchPortForwardsInjectable from "../../port-forward/watch-port-forwards.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";
import logger from "../../../common/logger";
import { ContainerPort } from "../container-port/view";

export interface PodDetailsContainerProps {
  pod: Pod | null | undefined;
  container: IPodContainer | null | undefined;
  metrics?: { [key: string]: IMetrics };
}

interface Dependencies {
  watchPortForwards: () => () => void;
  isMetricHidden: boolean;
}

const NonInjectedPodDetailsContainer = observer(({ watchPortForwards, isMetricHidden, pod, container, metrics }: Dependencies & PodDetailsContainerProps) => {
  useEffect(() => watchPortForwards(), []);

  if (!pod || !container) {
    return null;
  }

  if (!(pod instanceof Pod)) {
    logger.error("[PodDetails]: passed object that is not an instanceof Pod", pod);

    return null;
  }

  const renderStatus = (state: string, status: IPodContainerStatus) => {
    const ready = status ? status.ready : "";

    return (
      <span className={cssNames("status", state)}>
        {state}{ready ? `, ready` : ""}
        {state === "terminated" ? ` - ${status.state.terminated.reason} (exit code: ${status.state.terminated.exitCode})` : ""}
      </span>
    );
  };

  const renderLastState = (lastState: string, status: IPodContainerStatus) => {
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
  };

  const { name, image, imagePullPolicy, ports = [], volumeMounts = [], command, args } = container;
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

  return (
    <div className="PodDetailsContainer">
      <div className="pod-container-title">
        <StatusBrick className={cssNames(state, { ready })}/>{name}
      </div>
      {(!isMetricHidden && !isInitContainer) &&(
        <ResourceMetrics
          tabs={metricTabs}
          metrics={metrics}
        >
          <ContainerCharts/>
        </ResourceMetrics>
      )}
      {status && (
        <DrawerItem name="Status">
          {renderStatus(state, status)}
        </DrawerItem>
      )}
      {lastState && (
        <DrawerItem name="Last Status">
          {renderLastState(lastState, status)}
        </DrawerItem>
      )}
      <DrawerItem name="Image">
        <Badge label={image} tooltip={imageId}/>
      </DrawerItem>
      {imagePullPolicy && imagePullPolicy !== "IfNotPresent" &&(
        <DrawerItem name="ImagePullPolicy">
          {imagePullPolicy}
        </DrawerItem>
      )}
      {ports.length > 0 &&(
        <DrawerItem name="Ports">
          {
            ports.map((port) => (
              <ContainerPort
                object={pod}
                port={{
                  port: port.containerPort,
                  protocol: port.protocol,
                  name: port.name,
                }}
                key={`${container.name}-port-${port.containerPort}-${port.protocol}`}
              />
            ))
          }
        </DrawerItem>
      )}
      {<ContainerEnvironment container={container} namespace={pod.getNs()}/>}
      {volumeMounts.length > 0 &&(
        <DrawerItem name="Mounts">
          {
            volumeMounts.map(({ name, mountPath, readOnly }) => (
              <React.Fragment key={name + mountPath}>
                <span className="mount-path">{mountPath}</span>
                <span className="mount-from"> from {name} ({readOnly ? "ro" : "rw"})</span>
              </React.Fragment>
            ))
          }
        </DrawerItem>
      )}
      {liveness.length > 0 &&(
        <DrawerItem name="Liveness" labelsOnly>
          {
            liveness.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
      )}
      {readiness.length > 0 &&(
        <DrawerItem name="Readiness" labelsOnly>
          {
            readiness.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
      )}
      {startup.length > 0 &&(
        <DrawerItem name="Startup" labelsOnly>
          {
            startup.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
      )}
      {command &&(
        <DrawerItem name="Command">
          {command.join(" ")}
        </DrawerItem>
      )}
      {args &&(
        <DrawerItem name="Arguments">
          {args.join(" ")}
        </DrawerItem>
      )}
    </div>
  );
});

export const PodDetailsContainer = withInjectables<Dependencies, PodDetailsContainerProps>(NonInjectedPodDetailsContainer, {
  getProps: (di, props) => ({
    watchPortForwards: di.inject(watchPortForwardsInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.Container,
    }),
    ...props,
  }),
});
