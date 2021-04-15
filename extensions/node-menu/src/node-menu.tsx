import React from "react";
import { Component, K8sApi, Navigation } from "@k8slens/extensions";

const { MenuItem, MuiCore: { SvgIcon, Tooltip }, MaybeInteractive, Icons, Svgs } = Component;

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
  };

  const shell = () => {
    Component.createTerminalTab({
      title: `Node: ${nodeName}`,
      node: nodeName,
    });
    Navigation.hideDetails();
  };

  const cordon = () => {
    sendToTerminal(`kubectl cordon ${nodeName}`);
  };

  const unCordon = () => {
    sendToTerminal(`kubectl uncordon ${nodeName}`);
  };

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
    });
  };

  const renderCordoningButtons = () => {
    if (node.isUnschedulable()) {
      return (
        <MenuItem onClick={cordon}>
          <Tooltip title="Cordon">
            <MaybeInteractive isInteractive={toolbar}>
              <Icons.PauseCircleFilled />
            </MaybeInteractive>
          </Tooltip>
        </MenuItem>
      );
    }

    return (
      <MenuItem onClick={unCordon}>
        <Tooltip title="Uncordon">
          <MaybeInteractive isInteractive={toolbar}>
            <Icons.PlayCircleFilled />
          </MaybeInteractive>
        </Tooltip>
      </MenuItem>
    );
  };

  return (
    <>
      <MenuItem onClick={shell}>
        <Tooltip title="Node shell">
          <MaybeInteractive isInteractive={toolbar}>
            <SvgIcon component={Svgs.Ssh}/>
          </MaybeInteractive>
        </Tooltip>
      </MenuItem>
      {renderCordoningButtons()}
      <MenuItem onClick={drain}>
        <Tooltip title="Drain">
          <MaybeInteractive isInteractive={toolbar}>
            <Icons.DeleteSweep />
          </MaybeInteractive>
        </Tooltip>
      </MenuItem>
    </>
  );
}
