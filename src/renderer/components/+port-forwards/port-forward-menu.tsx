/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { cssNames } from "../../utils";
import { openPortForward, PortForwardItem, ForwardedPort } from "../../port-forward";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import removePortForwardInjectable from "../../port-forward/remove.injectable";
import startPortForwardInjectable from "../../port-forward/start.injectable";
import stopPortForwardInjectable from "../../port-forward/stop.injectable";
import openPortForwardDialogInjectable from "../../port-forward/open-dialog.injectable";

export interface PortForwardMenuProps extends MenuActionsProps {
  portForward: PortForwardItem;
  hideDetails?: () => void;
}

interface Dependencies {
  removePortForward: (portForward: ForwardedPort) => Promise<void>;
  startPortForward: (portForward: ForwardedPort) => Promise<ForwardedPort>;
  stopPortForward: (portForward: ForwardedPort) => Promise<ForwardedPort>;
  openPortForwardDialog: (portForward: ForwardedPort) => void;
}

const NonInjectedPortForwardMenu = observer(({ portForward, toolbar, hideDetails, openPortForwardDialog, className, removePortForward, stopPortForward, startPortForward, ...menuProps  }: Dependencies & PortForwardMenuProps) => {
  const remove = () => {
    try {
      removePortForward(portForward);
    } catch (error) {
      Notifications.error(`Error occurred stopping the port-forward from port ${portForward.forwardPort}. The port-forward may still be active.`);
    }
  };

  const startPortForwarding = async () => {
    const pf = await startPortForward(portForward);

    if (pf.status === "Disabled") {
      const { name, kind, forwardPort } = portForward;

      Notifications.error(`Error occurred starting port-forward, the local port ${forwardPort} may not be available or the ${kind} ${name} may not be reachable`);
    }
  };

  const renderStartStopMenuItem = () => {
    if (portForward.status === "Active") {
      return (
        <MenuItem onClick={() => stopPortForward(portForward)}>
          <Icon material="stop" tooltip="Stop port-forward" interactive={toolbar} />
          <span className="title">Stop</span>
        </MenuItem>
      );
    }

    return (
      <MenuItem onClick={startPortForwarding}>
        <Icon material="play_arrow" tooltip="Start port-forward" interactive={toolbar} />
        <span className="title">Start</span>
      </MenuItem>
    );
  };

  const renderContent = () => {
    if (!portForward) return null;

    return (
      <>
        { portForward.status === "Active" &&
          <MenuItem onClick={() => openPortForward(portForward)}>
            <Icon material="open_in_browser" interactive={toolbar} tooltip="Open in browser" />
            <span className="title">Open</span>
          </MenuItem>
        }
        <MenuItem onClick={() => openPortForwardDialog(portForward)}>
          <Icon material="edit" tooltip="Change port or protocol" interactive={toolbar} />
          <span className="title">Edit</span>
        </MenuItem>
        {renderStartStopMenuItem()}
      </>
    );
  };

  return (
    <MenuActions
      {...menuProps}
      className={cssNames("PortForwardMenu", className)}
      removeAction={remove}
    >
      {renderContent()}
    </MenuActions>
  );
});

export const PortForwardMenu = withInjectables<Dependencies, PortForwardMenuProps>(NonInjectedPortForwardMenu, {
  getProps: (di, props) => ({
    removePortForward: di.inject(removePortForwardInjectable),
    startPortForward: di.inject(startPortForwardInjectable),
    stopPortForward: di.inject(stopPortForwardInjectable),
    openPortForwardDialog: di.inject(openPortForwardDialogInjectable),
    ...props,
  }),
});
