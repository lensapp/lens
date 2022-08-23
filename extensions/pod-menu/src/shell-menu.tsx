/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
  App,
} = Common;

export interface PodShellMenuProps extends Renderer.Component.KubeObjectMenuProps<Pod> {
}

export class PodShellMenu extends React.Component<PodShellMenuProps> {
  async execShell(container?: string) {
    const { object: pod } = this.props;

    const kubectlPath = App.Preferences.getKubectlPath() || "kubectl";
    const commandParts = [
      kubectlPath,
      "exec",
      "-i",
      "-t",
      "-n", pod.getNs(),
      pod.getName(),
    ];

    if (window.navigator.platform !== "Win32") {
      commandParts.unshift("exec");
    }

    if (container) {
      commandParts.push("-c", container);
    }

    commandParts.push("--");

    if (pod.getSelectedNodeOs() === "windows") {
      commandParts.push("powershell");
    } else {
      commandParts.push('sh -c "clear; (bash || ash || sh)"');
    }

    const shell = createTerminalTab({
      title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()})`,
    });

    terminalStore.sendCommand(commandParts.join(" "), {
      enter: true,
      tabId: shell.id,
    });

    Navigation.hideDetails();
  }

  render() {
    const { object, toolbar } = this.props;
    const containers = object.getRunningContainers();

    if (!containers.length) return null;

    return (
      <MenuItem onClick={Util.prevDefault(() => this.execShell(containers[0].name))}>
        <Icon
          svg="ssh"
          interactive={toolbar}
          tooltip={toolbar && "Pod Shell"} 
        />
        <span className="title">Shell</span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right"/>
            <SubMenu>
              {
                containers.map(container => {
                  const { name } = container;

                  return (
                    <MenuItem
                      key={name}
                      onClick={Util.prevDefault(() => this.execShell(name))}
                      className="flex align-center"
                    >
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
