import "./pod-details-container.scss"

import React from "react";
import { t, Trans } from "@lingui/macro";
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
import { _i18n } from "../../i18n";

interface Props {
  pod: Pod;
  container: IPodContainer;
  metrics?: { [key: string]: IMetrics };
}

export class PodDetailsContainer extends React.Component<Props> {
  
  renderStatus(state: string, status: IPodContainerStatus) {
    const ready = status ? status.ready : ""
    return (
      <span className={cssNames("status", state)}>
        {state}{ready ? `, ${_i18n._(t`ready`)}` : ""}
        {state === 'terminated' ? ` - ${status.state.terminated.reason} (${_i18n._(t`exit code`)}: ${status.state.terminated.exitCode})` : ''}
      </span>    
    );
  }

  renderLastState(lastState: string, status: IPodContainerStatus) {
    if (lastState === 'terminated') {
      return (
        <span>
          {lastState}<br/> 
          {_i18n._(t`Reason`)}: {status.lastState.terminated.reason} - {_i18n._(t`exit code`)}: {status.lastState.terminated.exitCode}<br/> 
          {_i18n._(t`Started at`)}: {status.lastState.terminated.startedAt}<br/> 
          {_i18n._(t`Finished at`)}: {status.lastState.terminated.finishedAt}<br/> 
        </span>
      )  
    }
  }

  render() {
    const { pod, container, metrics } = this.props
    if (!pod || !container) return null
    const { name, image, imagePullPolicy, ports, volumeMounts, command, args } = container
    const status = pod.getContainerStatuses().find(status => status.name === container.name)
    const state = status ? Object.keys(status.state)[0] : ""
    const lastState = status ? Object.keys(status.lastState)[0] : ""
    const ready = status ? status.ready : ""
    const liveness = pod.getLivenessProbe(container)
    const readiness = pod.getReadinessProbe(container)
    const isInitContainer = !!pod.getInitContainers().find(c => c.name == name);
    const metricTabs = [
      <Trans>CPU</Trans>,
      <Trans>Memory</Trans>,
      <Trans>Filesystem</Trans>,
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
        <DrawerItem name={<Trans>Status</Trans>}>
          {this.renderStatus(state, status)}
        </DrawerItem>
        }
        {lastState &&
        <DrawerItem name={<Trans>Last Status</Trans>}>
          {this.renderLastState(lastState, status)}
        </DrawerItem>
        }
        <DrawerItem name={<Trans>Image</Trans>}>
          {image}
        </DrawerItem>
        {imagePullPolicy && imagePullPolicy !== "IfNotPresent" &&
        <DrawerItem name={<Trans>ImagePullPolicy</Trans>}>
          {imagePullPolicy}
        </DrawerItem>
        }
        {ports && ports.length > 0 &&
        <DrawerItem name={<Trans>Ports</Trans>}>
          {
            ports.map((port) => {
              const key = `${container.name}-port-${port.containerPort}-${port.protocol}`
              return(
                <PodContainerPort pod={pod} port={port} key={key}/>
              )
            })
          }
        </DrawerItem>
        }
        {<ContainerEnvironment container={container} namespace={pod.getNs()}/>}
        {volumeMounts && volumeMounts.length > 0 &&
        <DrawerItem name={<Trans>Mounts</Trans>}>
          {
            volumeMounts.map(mount => {
              const { name, mountPath, readOnly } = mount;
              return (
                <React.Fragment key={name + mountPath}>
                  <span className="mount-path">{mountPath}</span>
                  <span className="mount-from">from {name} ({readOnly ? 'ro' : 'rw'})</span>
                </React.Fragment>
              )
            })
          }
        </DrawerItem>
        }
        {liveness.length > 0 &&
        <DrawerItem name={<Trans>Liveness</Trans>} labelsOnly>
          {
            liveness.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
        }
        {readiness.length > 0 &&
        <DrawerItem name={<Trans>Readiness</Trans>} labelsOnly>
          {
            readiness.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
        }
        {command &&
        <DrawerItem name={<Trans>Command</Trans>}>
          {command.join(' ')}
        </DrawerItem>
        }

        {args &&
        <DrawerItem name={<Trans>Arguments</Trans>}>
          {args.join(' ')}
        </DrawerItem>
        }
      </div>
    )
  }
}