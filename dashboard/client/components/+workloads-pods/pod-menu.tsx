import "./pod-menu.scss";

import * as React from "react";
import { t, Trans } from "@lingui/macro";
import { MenuItem, SubMenu } from "../menu";
import { IPodContainer, Pod, nodesApi } from "../../api/endpoints";
import { Icon } from "../icon";
import { StatusBrick } from "../status-brick";
import { PodLogsDialog } from "./pod-logs-dialog";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { cssNames, prevDefault } from "../../utils";
import { terminalStore, createTerminalTab } from "../dock/terminal.store";
import { _i18n } from "../../i18n";
import { hideDetails } from "../../navigation";

interface Props extends KubeObjectMenuProps<Pod> {
}

export class PodMenu extends React.Component<Props> {
  async execShell(container?: string) {
    hideDetails();
    const { object: pod } = this.props
    const containerParam = container ? `-c ${container}` : ""
    let command = `kubectl exec -i -t -n ${pod.getNs()} ${pod.getName()} ${containerParam} "--"`
    if (process.platform !== "win32") {
      command = `exec ${command}`
    }
    if (pod.getSelectedNodeOs() === "windows") {
      command = `${command} powershell`
    } else {
      command = `${command} sh -c "clear; (bash || ash || sh)"`
    }

    const shell = createTerminalTab({
      title: _i18n._(t`Pod`) + `: ${pod.getName()} (namespace: ${pod.getNs()})`
    });

    terminalStore.sendCommand(command, {
      enter: true,
      tabId: shell.id
    });
  }

  showLogs(container: IPodContainer) {
    PodLogsDialog.open(this.props.object, container);
  }

  renderShellMenu() {
    const { object: pod, toolbar } = this.props
    const containers = pod.getRunningContainers();
    if (!containers.length) return;
    return (
      <MenuItem onClick={prevDefault(() => this.execShell(containers[0].name))}>
        <Icon svg="ssh" interactive={toolbar} title={_i18n._(t`Pod shell`)}/>
        <span className="title"><Trans>Shell</Trans></span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right"/>
            <SubMenu>
              {
                containers.map(container => {
                  const { name } = container;
                  return (
                    <MenuItem key={name} onClick={prevDefault(() => this.execShell(name))} className="flex align-center">
                      <StatusBrick/>
                      {name}
                    </MenuItem>
                  )
                })
              }
            </SubMenu>
          </>
        )}
      </MenuItem>
    )
  }

  renderLogsMenu() {
    const { object: pod, toolbar } = this.props
    const containers = pod.getAllContainers();
    const statuses = pod.getContainerStatuses();
    if (!containers.length) return;
    return (
      <MenuItem onClick={prevDefault(() => this.showLogs(containers[0]))}>
        <Icon material="subject" title={_i18n._(t`Logs`)} interactive={toolbar}/>
        <span className="title"><Trans>Logs</Trans></span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right"/>
            <SubMenu>
              {
                containers.map(container => {
                  const { name } = container
                  const status = statuses.find(status => status.name === name);
                  const brick = status ? (
                    <StatusBrick
                      className={cssNames(Object.keys(status.state)[0], { ready: status.ready })}
                    />
                  ) : null
                  return (
                    <MenuItem key={name} onClick={prevDefault(() => this.showLogs(container))} className="flex align-center">
                      {brick}
                      {name}
                    </MenuItem>
                  )
                })
              }
            </SubMenu>
          </>
        )}
      </MenuItem>
    )
  }

  render() {
    const { ...menuProps } = this.props;
    return (
      <KubeObjectMenu {...menuProps} className="PodMenu">
        {this.renderShellMenu()}
        {this.renderLogsMenu()}
      </KubeObjectMenu>
    )
  }
}
