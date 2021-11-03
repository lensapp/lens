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
import { HotbarStore } from "../../../common/hotbar-store";
import { CommandOverlay } from "../command-palette";
import { HotbarSwitchCommand } from "./hotbar-switch-command";
import { hotbarDisplayIndex } from "./hotbar-display-label";
import { TooltipPosition } from "../tooltip";
import { observer } from "mobx-react";
import type { Hotbar } from "../../../common/hotbar-types";

interface Props {
  hotbar: Hotbar;
}

export const HotbarSelector = observer(({ hotbar }: Props) => {
  const store = HotbarStore.getInstance();

  return (
    <div className="HotbarSelector flex align-center">
      <Icon material="play_arrow" className="previous box" onClick={() => store.switchToPrevious()} />
      <div className="box grow flex align-center">
        <Badge
          id="hotbarIndex"
          small
          label={hotbarDisplayIndex(store.activeHotbarId)}
          onClick={() => CommandOverlay.open(<HotbarSwitchCommand />)}
          tooltip={{
            preferredPositions: [TooltipPosition.TOP, TooltipPosition.TOP_LEFT],
            children: hotbar.name,
          }}
          className="SelectorIndex"
        />
      </div>
      <Icon material="play_arrow" className="next box" onClick={() => store.switchToNext()} />
    </div>
  );
});
