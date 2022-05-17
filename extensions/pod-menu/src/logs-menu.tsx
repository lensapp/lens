/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Renderer, Common } from "@k8slens/extensions";

type Pod = Renderer.K8sApi.Pod;
type IPodContainer = Renderer.K8sApi.IPodContainer;

const {
  Component: {
    logTabStore,
    MenuItem,
    Icon,
    SubMenu,
    StatusBrick,
  },
  Navigation,
} = Renderer;
const {
  Util,
} = Common;

export interface PodLogsMenuProps extends Renderer.Component.KubeObjectMenuProps<Pod> {
}

export class PodLogsMenu extends React.Component<PodLogsMenuProps> {
  showLogs(container: IPodContainer) {
    Navigation.hideDetails();
    const pod = this.props.object;

    logTabStore.createPodTab({
      selectedPod: pod,
      selectedContainer: container,
    });
  }

  render() {
    const { object: pod, toolbar } = this.props;
    const containers = pod.getAllContainers();
    const statuses = pod.getContainerStatuses();

    if (!containers.length) return null;

    return (
      <MenuItem onClick={Util.prevDefault(() => this.showLogs(containers[0]))}>
        <Icon
          material="subject"
          interactive={toolbar}
          tooltip={toolbar && "Pod Logs"}
        />
        <span className="title">Logs</span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right"/>
            <SubMenu>
              {
                containers.map(container => {
                  const { name } = container;
                  const status = statuses.find(status => status.name === name);
                  const brick = status ? (
                    <StatusBrick
                      className={Util.cssNames(Object.keys(status.state)[0], { ready: status.ready })}
                    />
                  ) : null;

                  return (
                    <MenuItem
                      key={name}
                      onClick={Util.prevDefault(() => this.showLogs(container))}
                      className="flex align-center"
                    >
                      {brick}
                      <span>{name}</span>
                    </MenuItem>
                  );
                })
              }
            </SubMenu>
          </>
        )}
      </MenuItem>
    );
  }
}
