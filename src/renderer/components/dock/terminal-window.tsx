/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./terminal-window.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import type { Terminal } from "./terminal";
import { TerminalStore } from "./terminal.store";
import { ThemeStore } from "../../theme.store";
import { dockStore, DockTab, TabKind, TabId } from "./dock.store";

interface Props {
  tab: DockTab;
}

@observer
export class TerminalWindow extends React.Component<Props> {
  public elem: HTMLElement;
  public terminal: Terminal;

  componentDidMount() {
    disposeOnUnmount(this, [
      dockStore.onTabChange(({ tabId }) => this.activate(tabId), {
        tabKind: TabKind.TERMINAL,
        fireImmediately: true,
      }),

      // refresh terminal available space (cols/rows) when <Dock/> resized
      dockStore.onResize(() => this.terminal?.fitLazy(), {
        fireImmediately: true,
      }),
    ]);
  }

  activate(tabId: TabId) {
    this.terminal?.detach(); // detach previous
    this.terminal = TerminalStore.getInstance().getTerminal(tabId);
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
