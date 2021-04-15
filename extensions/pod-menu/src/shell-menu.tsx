

import React from "react";
import { Component, K8sApi, Util, Navigation } from "@k8slens/extensions";

const { MuiCore: { Tooltip, SvgIcon }, Svgs, MaybeInteractive, MenuItem, SubMenu } = Component;

export interface PodShellMenuProps extends Component.KubeObjectMenuProps<K8sApi.Pod> {
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

    const shell = Component.createTerminalTab({
      title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()})`
    });

    Component.terminalStore.sendCommand(command, {
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
        <Tooltip title="Pod shell">
          <MaybeInteractive isInteractive={toolbar}>
            <SvgIcon component={Svgs.Ssh}/>
          </MaybeInteractive>
        </Tooltip>
        <span className="title">Shell</span>
        {containers.length > 1 && (
          <>
            <Component.Icon className="arrow" material="keyboard_arrow_right"/>
            <SubMenu>
              {
                containers.map(container => {
                  const { name } = container;

                  return (
                    <MenuItem key={name} onClick={Util.prevDefault(() => this.execShell(name))} className="flex align-center">
                      <Component.StatusBrick/>
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
