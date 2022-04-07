/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./terminal-dock-tab.scss";
import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { autoBind, cssNames } from "../../../utils";
import type { DockTabProps } from "../dock-tab";
import { DockTab } from "../dock-tab";
import { Icon } from "../../icon";
import type { TerminalStore } from "./store";
import type { DockStore } from "../dock/store";
import { reaction } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../dock/store.injectable";
import terminalStoreInjectable from "./store.injectable";

export interface TerminalTabProps extends DockTabProps {
}

interface Dependencies {
  dockStore: DockStore;
  terminalStore: TerminalStore;
}

@observer
class NonInjectedTerminalTab<Props extends TerminalTabProps & Dependencies> extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.isDisconnected === true, () => {
        this.props.dockStore.closeTab(this.tabId);
      }),
    ]);
  }

  get tabId() {
    return this.props.value.id;
  }

  get isDisconnected() {
    return this.props.terminalStore.isDisconnected(this.tabId);
  }

  reconnect() {
    this.props.terminalStore.reconnect(this.tabId);
  }

  render() {
    const tabIcon = <Icon material="terminal"/>;
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

export const TerminalTab = withInjectables<Dependencies, TerminalTabProps>(NonInjectedTerminalTab, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    terminalStore: di.inject(terminalStoreInjectable),
    ...props,
  }),
});

