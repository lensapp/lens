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
import { Component, K8sApi, Util, Navigation } from "@k8slens/extensions";

export interface PodLogsMenuProps extends Component.KubeObjectMenuProps<K8sApi.Pod> {
}

export class PodLogsMenu extends React.Component<PodLogsMenuProps> {
  showLogs(container: K8sApi.IPodContainer) {
    Navigation.hideDetails();
    const pod = this.props.object;

    Component.logTabStore.createPodTab({
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
      <Component.MenuItem onClick={Util.prevDefault(() => this.showLogs(containers[0]))}>
        <Component.Icon material="subject" title="Logs" interactive={toolbar}/>
        <span className="title">Logs</span>
        {containers.length > 1 && (
          <>
            <Component.Icon className="arrow" material="keyboard_arrow_right"/>
            <Component.SubMenu>
              {
                containers.map(container => {
                  const { name } = container;
                  const status = statuses.find(status => status.name === name);
                  const brick = status ? (
                    <Component.StatusBrick
                      className={Util.cssNames(Object.keys(status.state)[0], { ready: status.ready })}
                    />
                  ) : null;

                  return (
                    <Component.MenuItem key={name} onClick={Util.prevDefault(() => this.showLogs(container))} className="flex align-center">
                      {brick}
                      <span>{name}</span>
                    </Component.MenuItem>
                  );
                })
              }
            </Component.SubMenu>
          </>
        )}
      </Component.MenuItem>
    );
  }
}
