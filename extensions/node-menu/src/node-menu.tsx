import React from "react";
import { Component, K8sApi, Navigation} from "@k8slens/extensions"

export interface NodeMenuProps extends Component.KubeObjectMenuProps<K8sApi.Node> {
}

export function NodeMenu(props: NodeMenuProps) {
  const { object: node, toolbar } = props;
  if (!node) return null;
  const nodeName = node.getName();

  const sendToTerminal = (command: string) => {
    Component.terminalStore.sendCommand(command, {
      enter: true,
      newTab: true,
    });
    Navigation.hideDetails();
  }

  const shell = () => {
    Component.createTerminalTab({
      title: `Node: ${nodeName}`,
      node: nodeName,
    });
    Navigation.hideDetails();
  }

  const cordon = () => {
    sendToTerminal(`kubectl cordon ${nodeName}`);
  }

  const unCordon = () => {
    sendToTerminal(`kubectl uncordon ${nodeName}`)
  }

  const drain = () => {
    const command = `kubectl drain ${nodeName} --delete-local-data --ignore-daemonsets --force`;
    Component.ConfirmDialog.open({
      ok: () => sendToTerminal(command),
      labelOk: `Drain Node`,
      message: (
        <p>
          Are you sure you want to drain <b>{nodeName}</b>?
        </p>
      ),
    })
  }

  return (
    <>
      <Component.MenuItem onClick={shell}>
        <Component.Icon svg="ssh" interactive={toolbar} title="Node shell"/>
        <span className="title">Shell</span>
      </Component.MenuItem>
      {!node.isUnschedulable() && (
        <Component.MenuItem onClick={cordon}>
          <Component.Icon material="pause_circle_filled" title="Cordon" interactive={toolbar}/>
          <span className="title">Cordon</span>
        </Component.MenuItem>
      )}
      {node.isUnschedulable() && (
        <Component.MenuItem onClick={unCordon}>
          <Component.Icon material="play_circle_filled" title="Uncordon" interactive={toolbar}/>
          <span className="title">Uncordon</span>
        </Component.MenuItem>
      )}
      <Component.MenuItem onClick={drain}>
        <Component.Icon material="delete_sweep" title="Drain" interactive={toolbar}/>
        <span className="title">Drain</span>
      </Component.MenuItem>
    </>
  );
}
