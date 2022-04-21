/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./terminal-window.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../../utils";
import type { Terminal } from "./terminal";
import type { TerminalStore } from "./store";
import type { ThemeStore } from "../../../themes/store";
import type { DockTab, DockStore } from "../dock/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../dock/store.injectable";
import terminalStoreInjectable from "./store.injectable";
import assert from "assert";
import themeStoreInjectable from "../../../themes/store.injectable";

export interface TerminalWindowProps {
  tab: DockTab;
}

interface Dependencies {
  dockStore: DockStore;
  terminalStore: TerminalStore;
  themeStore: ThemeStore;
}

@observer
class NonInjectedTerminalWindow extends React.Component<TerminalWindowProps & Dependencies> {
  public elem: HTMLElement | null = null;
  public terminal!: Terminal;

  componentDidMount() {
    this.props.terminalStore.connect(this.props.tab);
    const terminal = this.props.terminalStore.getTerminal(this.props.tab.id);

    assert(terminal, "Terminal must be created for tab before mounting");
    this.terminal = terminal;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.terminal.attachTo(this.elem!);

    disposeOnUnmount(this, [
      // refresh terminal available space (cols/rows) when <Dock/> resized
      this.props.dockStore.onResize(() => this.terminal.onResize(), {
        fireImmediately: true,
      }),
    ]);
  }

  componentDidUpdate(): void {
    this.terminal.detach();
    this.props.terminalStore.connect(this.props.tab);
    const terminal = this.props.terminalStore.getTerminal(this.props.tab.id);

    assert(terminal, "Terminal must be created for tab before mounting");
    this.terminal = terminal;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.terminal.attachTo(this.elem!);
  }

  componentWillUnmount(): void {
    this.terminal.detach();
  }

  render() {
    return (
      <div
        className={cssNames("TerminalWindow", this.props.themeStore.activeTheme.type)}
        ref={elem => this.elem = elem}
      />
    );
  }
}

export const TerminalWindow = withInjectables<Dependencies, TerminalWindowProps>(NonInjectedTerminalWindow, {
  getProps: (di, props) => ({
    ...props,
    dockStore: di.inject(dockStoreInjectable),
    terminalStore: di.inject(terminalStoreInjectable),
    themeStore: di.inject(themeStoreInjectable),
  }),
});

