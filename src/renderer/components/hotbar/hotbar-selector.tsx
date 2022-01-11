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
