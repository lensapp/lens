import React from "react";
import { LensRendererExtension, Component, K8sApi } from "@k8slens/extensions";

const { Mui: { SvgIcon }, Icons, LensIcons } = Component;

function sendToTerminal(command: string) {
  Component.terminalStore.sendCommand(command, {
    enter: true,
    newTab: true,
  });
}

export default class NodeMenuRendererExtension extends LensRendererExtension {
  kubeObjectMenuItems: LensRendererExtension["kubeObjectMenuItems"] = [
    {
      kind: "Node",
      apiVersions: ["v1"],
      Icon: () => <SvgIcon component={LensIcons.Ssh}/>,
      text: "Shell",
      onClick: (node: K8sApi.Node) => {
        const nodeName = node.getName();

        Component.createTerminalTab({
          title: `Node: ${nodeName}`,
          node: nodeName,
        });
      },
      closeParent: true,
    },
    {
      kind: "Node",
      apiVersions: ["v1"],
      when: (node: K8sApi.Node) => !node.isUnschedulable(),
      Icon: Icons.PauseCircleFilled,
      text: "Cordon",
      onClick: (node: K8sApi.Node) => {
        sendToTerminal(`kubectl cordon ${node.getName()}`);
      },
      closeParent: true,
    },
    {
      kind: "Node",
      apiVersions: ["v1"],
      when: (node: K8sApi.Node) => node.isUnschedulable(),
      Icon: Icons.PlayCircleFilled,
      text: "Uncordon",
      onClick: (node: K8sApi.Node) => {
        sendToTerminal(`kubectl uncordon ${node.getName()}`);
      },
      closeParent: true,
    },
    {
      kind: "Node",
      apiVersions: ["v1"],
      Icon: Icons.DeleteSweep,
      text: "Drain",
      onClick: (node: K8sApi.Node) => {
        sendToTerminal(
          `kubectl drain ${node.getName()} --delete-local-data --ignore-daemonsets --force`
        );
      },
      confirmation: {
        labelOk: "Drain Node",
        Message: ({ object }) => (
          <p>
            Are you sure you want to drain <b>{object.getName()}</b>?
          </p>
        ),
      },
      closeParent: true,
    }
  ];
}
