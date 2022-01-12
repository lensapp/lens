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

import styles from "./hotbar-selector.module.scss";
import React, { useRef, useState } from "react";
import { Icon } from "../icon";
import { Badge } from "../badge";
import hotbarManagerInjectable from "../../../common/hotbar-store.injectable";
import { HotbarSwitchCommand } from "./hotbar-switch-command";
import { Tooltip, TooltipPosition } from "../tooltip";
import { observer } from "mobx-react";
import type { Hotbar } from "../../../common/hotbar-types";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import { cssNames } from "../../utils";

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

const NonInjectedHotbarSelector = observer(({ hotbar, hotbarManager, openCommandOverlay }: HotbarSelectorProps & Dependencies) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout>();

  const clearTimer = () => {
    clearTimeout(tooltipTimeout.current);
  };

  const onTooltipShow = () => {
    setTooltipVisible(true);
    clearTimer();
    tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 1500);
  };

  const onArrowClick = (switchTo: () => void) => {
    onTooltipShow();
    switchTo();
  };

  const onMouseEvent = (event: React.MouseEvent) => {
    clearTimer();
    setTooltipVisible(event.type == "mouseenter");
  };

  return (
    <div className={styles.HotbarSelector}>
      <Icon
        material="play_arrow"
        className={cssNames(styles.Icon, styles.previous)}
        onClick={() => onArrowClick(hotbarManager.switchToPrevious)}
      />
      <div className={styles.HotbarIndex}>
        <Badge
          id="hotbarIndex"
          small
          label={hotbarManager.getDisplayIndex(hotbarManager.getActive())}
          onClick={() => openCommandOverlay(<HotbarSwitchCommand />)}
          className={styles.Badge}
          onMouseEnter={onMouseEvent}
          onMouseLeave={onMouseEvent}
        />
        <Tooltip
          visible={tooltipVisible}
          targetId="hotbarIndex"
          preferredPositions={[TooltipPosition.TOP, TooltipPosition.TOP_LEFT]}
        >
          {hotbar.name}
        </Tooltip>
      </div>
      <Icon material="play_arrow" className={styles.Icon} onClick={() => onArrowClick(hotbarManager.switchToNext)} />
    </div>
  );
});

export const HotbarSelector = withInjectables<Dependencies, HotbarSelectorProps>(NonInjectedHotbarSelector, {
  getProps: (di, props) => ({
    hotbarManager: di.inject(hotbarManagerInjectable),
    openCommandOverlay: di.inject(commandOverlayInjectable).open,
    ...props,
  }),
});
