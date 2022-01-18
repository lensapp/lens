/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./hotbar-selector.scss";
import React from "react";
import { Icon } from "../icon";
import { Badge } from "../badge";
import hotbarManagerInjectable from "../../../common/hotbar-store.injectable";
import { HotbarSwitchCommand } from "./hotbar-switch-command";
import { TooltipPosition } from "../tooltip";
import { observer } from "mobx-react";
import type { Hotbar } from "../../../common/hotbar-types";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";

export interface HotbarSelectorProps {
  hotbar: Hotbar;
}

interface Dependencies {
  hotbarManager: {
    switchToPrevious: () => void;
    switchToNext: () => void;
    getActive: () => Hotbar;
    getDisplayIndex: (hotbar: Hotbar) => string;
  };
  openCommandOverlay: (component: React.ReactElement) => void;
}

const NonInjectedHotbarSelector = observer(({ hotbar, hotbarManager, openCommandOverlay }: HotbarSelectorProps & Dependencies) => (
  <div className="HotbarSelector flex align-center">
    <Icon material="play_arrow" className="previous box" onClick={() => hotbarManager.switchToPrevious()} />
    <div className="box grow flex align-center">
      <Badge
        id="hotbarIndex"
        small
        label={hotbarManager.getDisplayIndex(hotbarManager.getActive())}
        onClick={() => openCommandOverlay(<HotbarSwitchCommand />)}
        tooltip={{
          preferredPositions: [TooltipPosition.TOP, TooltipPosition.TOP_LEFT],
          children: hotbar.name,
        }}
        className="SelectorIndex"
      />
    </div>
    <Icon material="play_arrow" className="next box" onClick={() => hotbarManager.switchToNext()} />
  </div>
));

export const HotbarSelector = withInjectables<Dependencies, HotbarSelectorProps>(NonInjectedHotbarSelector, {
  getProps: (di, props) => ({
    hotbarManager: di.inject(hotbarManagerInjectable),
    openCommandOverlay: di.inject(commandOverlayInjectable).open,
    ...props,
  }),
});
