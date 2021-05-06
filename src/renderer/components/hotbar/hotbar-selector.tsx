import "./hotbar-selector.scss";
import React from "react";
import { Icon } from "../icon";
import { Badge } from "../badge";
import { Hotbar, HotbarStore } from "../../../common/hotbar-store";
import { CommandOverlay } from "../command-palette";
import { HotbarSwitchCommand } from "./hotbar-switch-command";
import { MaterialTooltip } from "../+catalog/material-tooltip/material-tooltip";

interface Props {
  hotbar: Hotbar;
}

export function HotbarSelector({ hotbar }: Props) {
  const store = HotbarStore.getInstance();
  const activeIndexDisplay = store.activeHotbarIndex + 1;

  return (
    <div className="HotbarSelector flex align-center">
      <Icon material="play_arrow" className="previous box" onClick={() => store.switchToPrevious()} />
      <div className="box grow flex align-center">
        <MaterialTooltip arrow title={hotbar.name}>
          <Badge
            id="hotbarIndex"
            small
            label={activeIndexDisplay}
            onClick={() => CommandOverlay.open(<HotbarSwitchCommand />)}
          />
        </MaterialTooltip>
      </div>
      <Icon material="play_arrow" className="next box" onClick={() => store.switchToNext()} />
    </div>
  );
}
