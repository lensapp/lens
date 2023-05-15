/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./hotbar-selector.module.scss";
import React, { useRef, useState } from "react";
import { Icon } from "@k8slens/icon";
import { Badge } from "../badge";
import { HotbarSwitchCommand } from "./hotbar-switch-command";
import { Tooltip, TooltipPosition } from "@k8slens/tooltip";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import { cssNames } from "@k8slens/utilities";
import type { IComputedValue } from "mobx";
import activeHotbarInjectable from "../../../features/hotbar/storage/common/active.injectable";
import type { SwitchToPreviousHotbar } from "../../../features/hotbar/storage/common/switch-to-previous.injectable";
import type { SwitchToNextHotbar } from "../../../features/hotbar/storage/common/switch-to-next.injectable";
import switchToNextHotbarInjectable from "../../../features/hotbar/storage/common/switch-to-next.injectable";
import switchToPreviousHotbarInjectable from "../../../features/hotbar/storage/common/switch-to-previous.injectable";
import type { Hotbar } from "../../../features/hotbar/storage/common/hotbar";
import type { ComputeDisplayIndex } from "../../../features/hotbar/storage/common/compute-display-index.injectable";
import computeDisplayIndexInjectable from "../../../features/hotbar/storage/common/compute-display-index.injectable";

interface Dependencies {
  activeHotbar: IComputedValue<Hotbar | undefined>;
  openCommandOverlay: (component: React.ReactElement) => void;
  switchToPreviousHotbar: SwitchToPreviousHotbar;
  switchToNextHotbar: SwitchToNextHotbar;
  computeDisplayIndex: ComputeDisplayIndex;
}

const NonInjectedHotbarSelector = observer(({
  activeHotbar,
  openCommandOverlay,
  switchToNextHotbar,
  switchToPreviousHotbar,
  computeDisplayIndex,
}: Dependencies) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimeout = useRef<number>();
  const hotbar = activeHotbar.get();

  function clearTimer() {
    clearTimeout(tooltipTimeout.current);
  }

  function onTooltipShow() {
    setTooltipVisible(true);
    clearTimer();
    tooltipTimeout.current = window.setTimeout(() => setTooltipVisible(false), 1500);
  }

  function onPrevClick() {
    onTooltipShow();
    switchToPreviousHotbar();
  }

  function onNextClick() {
    onTooltipShow();
    switchToNextHotbar();
  }

  function onMouseEvent(event: React.MouseEvent) {
    clearTimer();
    setTooltipVisible(event.type == "mouseenter");
  }

  return (
    <div className={styles.HotbarSelector}>
      <Icon
        material="arrow_left"
        className={cssNames(styles.Icon)}
        onClick={onPrevClick}
      />
      <div className={styles.HotbarIndex}>
        <Badge
          id="hotbarIndex"
          small
          label={hotbar ? computeDisplayIndex(hotbar.id) : "??"}
          onClick={() => openCommandOverlay(<HotbarSwitchCommand />)}
          className={styles.Badge}
          onMouseEnter={onMouseEvent}
          onMouseLeave={onMouseEvent}
          data-testid={`hotbar-menu-badge-for-${hotbar?.name.get()}`}
        />
        <Tooltip
          visible={tooltipVisible}
          targetId="hotbarIndex"
          preferredPositions={[TooltipPosition.TOP, TooltipPosition.TOP_LEFT]}
          data-testid={`hotbar-menu-badge-tooltip-for-${hotbar?.name.get()}`}
        >
          {hotbar?.name.get()}
        </Tooltip>
      </div>
      <Icon
        material="arrow_right"
        className={styles.Icon}
        onClick={onNextClick}
      />
    </div>
  );
});

export const HotbarSelector = withInjectables<Dependencies>(NonInjectedHotbarSelector, {
  getProps: (di, props) => ({
    ...props,
    openCommandOverlay: di.inject(commandOverlayInjectable).open,
    activeHotbar: di.inject(activeHotbarInjectable),
    switchToNextHotbar: di.inject(switchToNextHotbarInjectable),
    switchToPreviousHotbar: di.inject(switchToPreviousHotbarInjectable),
    computeDisplayIndex: di.inject(computeDisplayIndexInjectable),
  }),
});
