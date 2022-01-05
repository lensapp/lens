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

import React from "react";
import { boundMethod, cssNames } from "../../utils";
import { openPortForward, PortForwardItem, removePortForward, PortForwardDialog, startPortForward, stopPortForward } from "../../port-forward";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { Notifications } from "../notifications";

interface Props extends MenuActionsProps {
  portForward: PortForwardItem;
  hideDetails?(): void;
}

export class PortForwardMenu extends React.Component<Props> {
  @boundMethod
  remove() {
    const { portForward } = this.props;

    try {
      removePortForward(portForward);
    } catch (error) {
      Notifications.error(`Error occurred stopping the port-forward from port ${portForward.forwardPort}. The port-forward may still be active.`);
    }
  }

  private startPortForwarding = async () => {
    const { portForward } = this.props;

    const pf = await startPortForward(portForward);

    if (pf.status === "Disabled") {
      const { name, kind, forwardPort } = portForward;

      Notifications.error(`Error occurred starting port-forward, the local port ${forwardPort} may not be available or the ${kind} ${name} may not be reachable`);
    }
  };

  renderStartStopMenuItem() {
    const { portForward, toolbar } = this.props;

    if (portForward.status === "Active") {
      return (
        <MenuItem onClick={() => stopPortForward(portForward)}>
          <Icon material="stop" tooltip="Stop port-forward" interactive={toolbar} />
          <span className="title">Stop</span>
        </MenuItem>
      );
    }

    return (
      <MenuItem onClick={this.startPortForwarding}>
        <Icon material="play_arrow" tooltip="Start port-forward" interactive={toolbar} />
        <span className="title">Start</span>
      </MenuItem>
    );
  }

  renderContent() {
    const { portForward, toolbar } = this.props;

    if (!portForward) return null;

    return (
      <>
        { portForward.status === "Active" &&
          <MenuItem onClick={() => openPortForward(portForward)}>
            <Icon material="open_in_browser" interactive={toolbar} tooltip="Open in browser" />
            <span className="title">Open</span>
          </MenuItem>
        }
        <MenuItem onClick={() => PortForwardDialog.open(portForward)}>
          <Icon material="edit" tooltip="Change port or protocol" interactive={toolbar} />
          <span className="title">Edit</span>
        </MenuItem>
        {this.renderStartStopMenuItem()}
      </>
    );
  }

  render() {
    const { className, ...menuProps } = this.props;

    return (
      <MenuActions
        {...menuProps}
        className={cssNames("PortForwardMenu", className)}
        removeAction={this.remove}
      >
        {this.renderContent()}
      </MenuActions>
    );
  }
}
