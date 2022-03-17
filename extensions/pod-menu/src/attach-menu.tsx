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

export interface PodAttachMenuProps extends Renderer.Component.KubeObjectMenuProps<Pod> {
}

export class PodAttachMenu extends React.Component<PodAttachMenuProps> {
  async attachToPod(container?: string) {
    const { object: pod } = this.props;

    const kubectlPath = App.Preferences.getKubectlPath() || "kubectl";
    const commandParts = [
      kubectlPath,
      "attach",
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

    const shell = createTerminalTab({
      title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()}) [Attached]`,
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
      <MenuItem onClick={Util.prevDefault(() => this.attachToPod(containers[0].name))}>
        <Icon
          material="pageview"
          interactive={toolbar}
          tooltip={toolbar && "Attach to Pod"}
        />
        <span className="title">Attach Pod</span>
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
                      onClick={Util.prevDefault(() => this.attachToPod(name))}
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
