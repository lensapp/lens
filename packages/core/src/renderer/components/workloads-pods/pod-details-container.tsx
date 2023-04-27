/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details-container.scss";

import React from "react";
import type { Container, PodContainerStatus, Pod } from "@k8slens/kube-object";
import { DrawerItem } from "../drawer";
import { cssNames, isDefined } from "@k8slens/utilities";
import { StatusBrick } from "../status-brick";
import { Badge } from "../badge";
import { ContainerEnvironment } from "./pod-container-env";
import { PodContainerPort } from "./pod-container-port";
import { LocaleDate } from "../locale-date";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { PortForwardStore } from "../../port-forward";
import { disposeOnUnmount, observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import portForwardStoreInjectable from "../../port-forward/port-forward-store/port-forward-store.injectable";
import type { IComputedValue } from "mobx";
import enabledMetricsInjectable from "../../api/catalog/entity/metrics-enabled.injectable";
import type { PodDetailsContainerMetricsComponent } from "@k8slens/metrics";
import { podDetailsContainerMetricsInjectionToken } from "@k8slens/metrics";

export interface PodDetailsContainerProps {
  pod: Pod;
  container: Container;
}

interface Dependencies {
  portForwardStore: PortForwardStore;
  containerMetricsVisible: IComputedValue<boolean>;
  containerMetrics: PodDetailsContainerMetricsComponent[];
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
    const { pod, container, containerMetricsVisible, containerMetrics } = this.props;

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
    const isMetricVisible = containerMetricsVisible.get();

    return (
      <div className="PodDetailsContainer">
        <div className="pod-container-title">
          <StatusBrick className={cssNames(state, { ready })}/>
          {name}
        </div>
        {(isMetricVisible && !isInitContainer) && (
          <>
            {containerMetrics.map(ContainerMetrics => (
              <ContainerMetrics.Component
                key={ContainerMetrics.id}
                container={container}
                pod={pod}/>
            ))}
          </>
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
    containerMetricsVisible: di.inject(enabledMetricsInjectable, ClusterMetricsResourceType.Container),
    containerMetrics: di.injectMany(podDetailsContainerMetricsInjectionToken),
  }),
});
