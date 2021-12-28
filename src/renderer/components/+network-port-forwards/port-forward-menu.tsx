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
import { openPortForward, PortForwardItem } from "../../port-forward";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import removePortForwardInjectable
  from "../../port-forward/port-forward-store/remove-port-forward/remove-port-forward.injectable";
import portForwardDialogModelInjectable
  from "../../port-forward/port-forward-dialog-model/port-forward-dialog-model.injectable";

interface Props extends MenuActionsProps {
  portForward: PortForwardItem;
  hideDetails?(): void;
}

interface Dependencies {
  removePortForward: (item: PortForwardItem) => Promise<void>,
  openPortForwardDialog: (item: PortForwardItem) => void
}

class NonInjectedPortForwardMenu extends React.Component<Props & Dependencies> {
  @boundMethod
  remove() {
    const { portForward } = this.props;

    try {
      this.props.removePortForward(portForward);
    } catch (error) {
      Notifications.error(`Error occurred stopping the port-forward from port ${portForward.forwardPort}. The port-forward may still be active.`);
    }
  }

  renderContent() {
    const { portForward, toolbar } = this.props;

    if (!portForward) return null;

    return (
      <>
        <MenuItem onClick={() => openPortForward(this.props.portForward)}>
          <Icon material="open_in_browser" interactive={toolbar} tooltip="Open in browser" />
          <span className="title">Open</span>
        </MenuItem>
        <MenuItem onClick={() => this.props.openPortForwardDialog(portForward)}>
          <Icon material="edit" tooltip="Change port or protocol" interactive={toolbar} />
          <span className="title">Edit</span>
        </MenuItem>
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

export const PortForwardMenu = withInjectables<Dependencies, Props>(
  NonInjectedPortForwardMenu,

  {
    getProps: (di, props) => ({
      removePortForward: di.inject(removePortForwardInjectable),
      openPortForwardDialog: di.inject(portForwardDialogModelInjectable).open,
      ...props,
    }),
  },
);
