

import React from "react";
import { Component, K8sApi, Util, Navigation } from "@k8slens/extensions";

export interface PodShellMenuProps extends Component.KubeObjectMenuProps<K8sApi.Pod> {
}

export class PodShellMenu extends React.Component<PodShellMenuProps> {
  async execShell(container?: string) {
    Navigation.hideDetails();
    const { object: pod } = this.props
    const containerParam = container ? `-c ${container}` : ""
    let command = `kubectl exec -i -t -n ${pod.getNs()} ${pod.getName()} ${containerParam} "--"`
    if (window.navigator.platform !== "Win32") {
      command = `exec ${command}`
    }
    if (pod.getSelectedNodeOs() === "windows") {
      command = `${command} powershell`
    } else {
      command = `${command} sh -c "clear; (bash || ash || sh)"`
    }

    const shell = Component.createTerminalTab({
      title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()})`
    });

    Component.terminalStore.sendCommand(command, {
      enter: true,
      tabId: shell.id
    });
  }

  render() {
    const { object, toolbar } = this.props
    const containers = object.getRunningContainers();
    if (!containers.length) return null;
    return (
      <Component.MenuItem onClick={Util.prevDefault(() => this.execShell(containers[0].name))}>
        <Component.Icon svg="ssh" interactive={toolbar} title="Pod shell"/>
        <span className="title">Shell</span>
        {containers.length > 1 && (
          <>
            <Component.Icon className="arrow" material="keyboard_arrow_right"/>
            <Component.SubMenu>
              {
                containers.map(container => {
                  const { name } = container;
                  return (
                    <Component.MenuItem key={name} onClick={Util.prevDefault(() => this.execShell(name))} className="flex align-center">
                      <Component.StatusBrick/>
                      {name}
                    </Component.MenuItem>
                  )
                })
              }
            </Component.SubMenu>
          </>
        )}
      </Component.MenuItem>
    )
  }
}
