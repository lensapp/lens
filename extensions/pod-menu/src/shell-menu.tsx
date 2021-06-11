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

export interface PodShellMenuProps extends Renderer.Component.KubeObjectMenuProps<Pod> {
}

export class PodShellMenu extends React.Component<PodShellMenuProps> {
  async execShell(container?: string) {
    Navigation.hideDetails();
    const { object: pod } = this.props;
    const containerParam = container ? `-c ${container}` : "";
    let command = `kubectl exec -i -t -n ${pod.getNs()} ${pod.getName()} ${containerParam} "--"`;

    if (window.navigator.platform !== "Win32") {
      command = `exec ${command}`;
    }

    if (pod.getSelectedNodeOs() === "windows") {
      command = `${command} powershell`;
    } else {
      command = `${command} sh -c "clear; (bash || ash || sh)"`;
    }

    const shell = createTerminalTab({
      title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()})`
    });

    terminalStore.sendCommand(command, {
      enter: true,
      tabId: shell.id
    });
  }

  render() {
    const { object, toolbar } = this.props;
    const containers = object.getRunningContainers();

    if (!containers.length) return null;

    return (
      <MenuItem onClick={Util.prevDefault(() => this.execShell(containers[0].name))}>
        <Icon svg="ssh" interactive={toolbar} tooltip={toolbar && "Pod Shell"} />
        <span className="title">Shell</span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right"/>
            <SubMenu>
              {
                containers.map(container => {
                  const { name } = container;

                  return (
                    <MenuItem key={name} onClick={Util.prevDefault(() => this.execShell(name))} className="flex align-center">
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
