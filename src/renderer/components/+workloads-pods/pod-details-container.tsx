import "./pod-details-container.scss";

import React from "react";
import { IPodContainer, IPodContainerStatus, Pod } from "../../api/endpoints";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { StatusBrick } from "../status-brick";
import { Badge } from "../badge";
import { ContainerEnvironment } from "./pod-container-env";
import { PodContainerPort } from "./pod-container-port";
import { ResourceMetrics } from "../resource-metrics";
import { IMetrics } from "../../api/endpoints/metrics.api";
import { ContainerCharts } from "./container-charts";

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
          Started at: {status.lastState.terminated.startedAt}<br/>
          Finished at: {status.lastState.terminated.finishedAt}<br/>
        </span>
      );
    }
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

    return (
      <div className="PodDetailsContainer">
        <div className="pod-container-title">
          <StatusBrick className={cssNames(state, { ready })}/>{name}
        </div>
        {!isInitContainer &&
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

              return(
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
