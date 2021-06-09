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

import "./terminal-tab.scss";

import React from "react";
import { observer } from "mobx-react";
import { boundMethod, cssNames } from "../../utils";
import { DockTab, DockTabProps } from "./dock-tab";
import { Icon } from "../icon";
import { terminalStore } from "./terminal.store";
import { dockStore } from "./dock.store";
import { reaction } from "mobx";

interface Props extends DockTabProps {
}

@observer
export class TerminalTab extends React.Component<Props> {
  componentDidMount() {
    reaction(() => this.isDisconnected === true, () => {
      dockStore.closeTab(this.tabId);
    });
  }

  get tabId() {
    return this.props.value.id;
  }

  get isDisconnected() {
    return terminalStore.isDisconnected(this.tabId);
  }

  @boundMethod
  reconnect() {
    terminalStore.reconnect(this.tabId);
  }

  render() {
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
            tooltip="Restart session"
            onClick={this.reconnect}
          />
        )}
      />
    );
  }
}
