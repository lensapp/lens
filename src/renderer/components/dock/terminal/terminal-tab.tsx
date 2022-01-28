/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./terminal-tab.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../../utils";
import { DockTab, DockTabProps } from "../dock-tab/dock-tab";
import { Icon } from "../../icon";
import type { TabId } from "../dock/store";
import { reaction } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import closeDockTabInjectable from "../dock/close-tab.injectable";
import isTerminalDisconnectedInjectable from "./is-disconnected.injectable";
import reconnectTerminalInjectable from "./reconnect.injectable";

export interface TerminalTabProps extends DockTabProps {
}

interface Dependencies {
  closeDockTab: (tabId: TabId) => void;
  isTerminalDisconnected: (tabId: TabId) => boolean;
  reconnectTerminal: (tabId: TabId) => void;
}

const NonInjectedTerminalTab = observer(({ reconnectTerminal, isTerminalDisconnected, closeDockTab, value: tab, className, ...props }: Dependencies & TerminalTabProps) => {
  useEffect(() => reaction(
    () => isTerminalDisconnected(tab.id),
    isDisconnected => {
      if (isDisconnected) {
        closeDockTab(tab.id);
      }
    },
  ), []);

  const disconnected = isTerminalDisconnected(tab.id);
  const tabIcon = <Icon svg="terminal" />;
  const classNames = cssNames("TerminalTab", className, { disconnected });

  return (
    <DockTab
      {...props}
      className={classNames}
      icon={tabIcon}
      value={tab}
      moreActions={disconnected && (
        <Icon
          small
          material="refresh"
          className="restart-icon"
          tooltip="Restart session"
          onClick={() => reconnectTerminal(tab.id)}
        />
      )}
    />
  );
});

export const TerminalTab = withInjectables<Dependencies, TerminalTabProps>(NonInjectedTerminalTab, {
  getProps: (di, props) => ({
    closeDockTab: di.inject(closeDockTabInjectable),
    isTerminalDisconnected: di.inject(isTerminalDisconnectedInjectable),
    reconnectTerminal: di.inject(reconnectTerminalInjectable),
    ...props,
  }),
});
