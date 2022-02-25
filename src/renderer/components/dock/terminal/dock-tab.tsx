/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./terminal-dock-tab.scss";
import React from "react";
import { observer } from "mobx-react";
import { boundMethod, cssNames } from "../../../utils";
import { DockTab, DockTabProps } from "../dock-tab";
import { Icon } from "../../icon";
import type { TerminalStore } from "./store";
import type { DockStore } from "../dock/store";
import { reaction } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../dock/store.injectable";
import terminalStoreInjectable from "./store.injectable";

interface Props extends DockTabProps {
}

interface Dependencies {
  dockStore: DockStore;
  terminalStore: TerminalStore;
}

@observer
class NonInjectedTerminalTab extends React.Component<Props & Dependencies> {
  componentDidMount() {
    reaction(() => this.isDisconnected === true, () => {
      this.props.dockStore.closeTab(this.tabId);
    });
  }

  get tabId() {
    return this.props.value.id;
  }

  get isDisconnected() {
    return this.props.terminalStore.isDisconnected(this.tabId);
  }

  @boundMethod
  reconnect() {
    this.props.terminalStore.reconnect(this.tabId);
  }

  render() {
    const tabIcon = <Icon svg="terminal"/>;
    const className = cssNames("TerminalTab", this.props.className, {
      disconnected: this.isDisconnected,
    });

    const { dockStore, terminalStore, ...tabProps } = this.props;

    return (
      <DockTab
        {...tabProps}
        className={className}
        icon={tabIcon}
        moreActions={this.isDisconnected && (
          <Icon
            small
            material="refresh"
            className="restart-icon"
            tooltip="Restart session"
            onClick={this.reconnect}
          />
        )}
      />
    );
  }
}

export const TerminalTab = withInjectables<Dependencies, Props>(NonInjectedTerminalTab, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    terminalStore: di.inject(terminalStoreInjectable),
    ...props,
  }),
});

