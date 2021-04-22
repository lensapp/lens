import "./terminal-window.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import { IDockTab } from "./dock.store";
import { Terminal } from "./terminal";
import { terminalStore } from "./terminal.store";
import { ThemeStore } from "../../theme.store";

interface Props {
  className?: string;
  tab: IDockTab;
}

@observer
export class TerminalWindow extends React.Component<Props> {
  public elem: HTMLElement;
  public terminal: Terminal;

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.tab.id, tabId => this.activate(tabId), {
        fireImmediately: true
      })
    ]);
  }

  activate(tabId = this.props.tab.id) {
    if (this.terminal) this.terminal.detach(); // detach previous
    this.terminal = terminalStore.getTerminal(tabId);
    this.terminal.attachTo(this.elem);
  }

  render() {
    const { className } = this.props;

    return (
      <div
        className={cssNames("TerminalWindow", className, ThemeStore.getInstance().activeTheme.type)}
        ref={e => this.elem = e}
      />
    );
  }
}
