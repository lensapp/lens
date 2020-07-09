import "./terminal-tab.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { autobind, cssNames } from "../../utils";
import { DockTab, DockTabProps } from "./dock-tab";
import { Icon } from "../icon";
import { terminalStore } from "./terminal.store";
import { dockStore } from "./dock.store";
import { reaction } from "mobx";

interface Props extends DockTabProps {
}

@observer
export class TerminalTab extends React.Component<Props> {
  componentDidMount(): void {
    reaction(() => this.isDisconnected === true, () => {
      dockStore.closeTab(this.tabId);
    });
  }

  get tabId(): string {
    return this.props.value.id || "";
  }

  get isDisconnected(): boolean {
    return terminalStore.isDisconnected(this.tabId);
  }

  @autobind()
  reconnect(): void {
    terminalStore.reconnect(this.tabId);
  }

  render(): JSX.Element {
    const tabIcon = <Icon svg="terminal"/>;
    const className = cssNames("TerminalTab", this.props.className, {
      disconnected: this.isDisconnected,
    });

    return (
      <DockTab
        {...this.props}
        className={className}
        icon={tabIcon}
        moreActions={this.isDisconnected && (
          <Icon
            small
            material="refresh"
            className="restart-icon"
            tooltip={<Trans>Restart session</Trans>}
            onClick={this.reconnect}
          />
        )}
      />
    );
  }
}
