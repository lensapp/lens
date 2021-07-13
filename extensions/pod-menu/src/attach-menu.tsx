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

const {
  Component: {
    createTerminalTab,
    terminalStore,
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

export interface PodAttachMenuProps extends Renderer.Component.KubeObjectMenuProps<Pod> {
}

export class PodAttachMenu extends React.Component<PodAttachMenuProps> {
  async attachToPod(container?: string) {
    const { object: pod } = this.props;
    const containerParam = container ? `-c ${container}` : "";
    let command = `kubectl attach -i -t -n ${pod.getNs()} ${pod.getName()} ${containerParam}`;

    if (window.navigator.platform !== "Win32") {
      command = `exec ${command}`;
    }

    const shell = createTerminalTab({
      title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()}) [Attached]`
    });

    terminalStore.sendCommand(command, {
      enter: true,
      tabId: shell.id
    });
    
    Navigation.hideDetails();
  }

  render() {
    const { object, toolbar } = this.props;
    const containers = object.getRunningContainers();

    if (!containers.length) return null;

    return (
      <MenuItem onClick={Util.prevDefault(() => this.attachToPod(containers[0].name))}>
        <Icon material="pageview" interactive={toolbar} tooltip={toolbar && "Attach to Pod"}/>
        <span className="title">Attach Pod</span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right"/>
            <SubMenu>
              {
                containers.map(container => {
                  const { name } = container;

                  return (
                    <MenuItem key={name} onClick={Util.prevDefault(() => this.attachToPod(name))} className="flex align-center">
                      <StatusBrick/>
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
