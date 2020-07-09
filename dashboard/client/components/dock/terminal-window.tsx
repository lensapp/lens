import "./terminal-window.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import { DockTabData } from "./dock.store";
import { Terminal } from "./terminal";
import { terminalStore } from "./terminal.store";
import { themeStore } from "../../theme.store";

interface Props {
  className?: string;
  tab: DockTabData;
}

@observer
export class TerminalWindow extends React.Component<Props> {
  public elem: HTMLElement;
  public terminal: Terminal;

  componentDidMount(): void {
    disposeOnUnmount(this, [
      reaction(() => this.props.tab.id, tabId => this.activate(tabId), {
        fireImmediately: true
      })
    ]);
  }

  activate(tabId = this.props.tab.id): void {
    if (this.terminal) {
      this.terminal.detach();
    } // detach previous
    this.terminal = terminalStore.getTerminal(tabId);
    this.terminal.attachTo(this.elem);
  }

  render(): JSX.Element {
    const { className } = this.props;
    return (
      <div
        className={cssNames("TerminalWindow", className, themeStore.activeTheme.type)}
        ref={(e): void => {
          this.elem = e;
        }}
      />
    );
  }
}
