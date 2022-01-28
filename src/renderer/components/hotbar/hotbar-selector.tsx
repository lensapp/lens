/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./hotbar-selector.module.scss";
import React, { useRef, useState } from "react";
import { Icon } from "../icon";
import { Badge } from "../badge";
import hotbarStoreInjectable from "../../../common/hotbar-store/store.injectable";
import { HotbarSwitchCommand } from "./hotbar-switch-command";
import { Tooltip, TooltipPosition } from "../tooltip";
import { observer } from "mobx-react";
import type { Hotbar } from "../../../common/hotbar-store/hotbar";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import { cssNames } from "../../utils";

interface Dependencies {
  hotbarManager: {
    switchToPrevious: () => void;
    switchToNext: () => void;
    getActive: () => Hotbar;
    getDisplayIndex: (hotbar: Hotbar) => string;
  };
  openCommandOverlay: (component: React.ReactElement) => void;
}

export interface HotbarSelectorProps extends Partial<Dependencies> {
  hotbar: Hotbar;
}

const NonInjectedHotbarSelector = observer(({ hotbar, hotbarManager, openCommandOverlay }: HotbarSelectorProps & Dependencies) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout>();

  function clearTimer() {
    clearTimeout(tooltipTimeout.current);
  }

  function onTooltipShow() {
    setTooltipVisible(true);
    clearTimer();
    tooltipTimeout.current = setTimeout(() => setTooltipVisible(false), 1500);
  }

  function onArrowClick(switchTo: () => void) {
    onTooltipShow();
    switchTo();
  }

  function onMouseEvent(event: React.MouseEvent) {
    clearTimer();
    setTooltipVisible(event.type == "mouseenter");
  }

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
    hotbarManager: di.inject(hotbarStoreInjectable),
    openCommandOverlay: di.inject(commandOverlayInjectable).open,
    ...props,
  }),
});
