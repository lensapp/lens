/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./terminal-window.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import type { Terminal } from "./terminal/terminal";
import type { TerminalStore } from "./terminal-store/terminal.store";
import { ThemeStore } from "../../theme.store";
import { DockTab, TabKind, TabId, DockStore } from "./dock-store/dock.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "./dock-store/dock-store.injectable";
import terminalStoreInjectable from "./terminal-store/terminal-store.injectable";

interface Props {
  tab: DockTab;
}

interface Dependencies {
  dockStore: DockStore
  terminalStore: TerminalStore
}

@observer
class NonInjectedTerminalWindow extends React.Component<Props & Dependencies> {
  public elem: HTMLElement;
  public terminal: Terminal;

  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.dockStore.onTabChange(({ tabId }) => this.activate(tabId), {
        tabKind: TabKind.TERMINAL,
        fireImmediately: true,
      }),

      // refresh terminal available space (cols/rows) when <Dock/> resized
      this.props.dockStore.onResize(() => this.terminal?.fitLazy(), {
        fireImmediately: true,
      }),
    ]);
  }

  activate(tabId: TabId) {
    this.terminal?.detach(); // detach previous
    this.terminal = this.props.terminalStore.getTerminal(tabId);
    this.terminal.attachTo(this.elem);
  }

  render() {
    return (
      <div
        className={cssNames("TerminalWindow", ThemeStore.getInstance().activeTheme.type)}
        ref={elem => this.elem = elem}
      />
    );
  }
}

export const TerminalWindow = withInjectables<Dependencies, Props>(
  NonInjectedTerminalWindow,

  {
    getProps: (di, props) => ({
      dockStore: di.inject(dockStoreInjectable),
      terminalStore: di.inject(terminalStoreInjectable),
      ...props,
    }),
  },
);

