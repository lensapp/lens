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
        <Icon material="subject" interactive={toolbar} tooltip={toolbar && "Pod Logs"}/>
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
                    <MenuItem key={name} onClick={Util.prevDefault(() => this.showLogs(container))} className="flex align-center">
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
