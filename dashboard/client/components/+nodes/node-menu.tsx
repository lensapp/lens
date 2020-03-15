import * as React from "react";
import { t, Trans } from "@lingui/macro";
import { Node } from "../../api/endpoints/nodes.api";
import { createTerminalTab, terminalStore } from "../dock/terminal.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { ConfirmDialog } from "../confirm-dialog";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";
import { hideDetails } from "../../navigation";

export function NodeMenu(props: KubeObjectMenuProps<Node>) {
  const { object: node, toolbar } = props;
  if (!node) return null;
  const nodeName = node.getName();

  const sendToTerminal = (command: string) => {
    terminalStore.sendCommand(command, {
      enter: true,
      newTab: true,
    });
    hideDetails();
  }

  const shell = () => {
    createTerminalTab({
      title: _i18n._(t`Shell: ${nodeName}`),
      node: nodeName,
    });
    hideDetails();
  }

  const cordon = () => {
    sendToTerminal(`kubectl cordon ${nodeName}`);
  }

  const unCordon = () => {
    sendToTerminal(`kubectl uncordon ${nodeName}`)
  }

  const drain = () => {
    const command = `kubectl drain ${nodeName} --delete-local-data --ignore-daemonsets --force`;
    ConfirmDialog.open({
      ok: () => sendToTerminal(command),
      labelOk: _i18n._(t`Drain Node`),
      message: (
        <p>
          <Trans>Are you sure you want to drain <b>{nodeName}</b>?</Trans>
        </p>
      ),
    })
  }

  return (
    <KubeObjectMenu {...props}>
      <MenuItem onClick={shell}>
        <Icon svg="ssh" interactive={toolbar} title={_i18n._(t`Node shell`)}/>
        <span className="title"><Trans>Shell</Trans></span>
      </MenuItem>
      {!node.isUnschedulable() && (
        <MenuItem onClick={cordon}>
          <Icon material="pause_circle_filled" title={_i18n._(t`Cordon`)} interactive={toolbar}/>
          <span className="title"><Trans>Cordon</Trans></span>
        </MenuItem>
      )}
      {node.isUnschedulable() && (
        <MenuItem onClick={unCordon}>
          <Icon material="play_circle_filled" title={_i18n._(t`Uncordon`)} interactive={toolbar}/>
          <span className="title"><Trans>Uncordon</Trans></span>
        </MenuItem>
      )}
      <MenuItem onClick={drain}>
        <Icon material="delete_sweep" title={_i18n._(t`Drain`)} interactive={toolbar}/>
        <span className="title"><Trans>Drain</Trans></span>
      </MenuItem>
    </KubeObjectMenu>
  );
}