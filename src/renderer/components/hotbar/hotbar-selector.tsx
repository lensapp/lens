import "./hotbar-selector.scss";
import React from "react";
import { Icon } from "../icon";
import { Badge } from "../badge";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Hotbar, HotbarStore } from "../../../common/hotbar-store";
import { CommandOverlay } from "../command-palette";
import { HotbarSwitchCommand } from "./hotbar-switch-command";

interface Props {
  hotbar: Hotbar;
}

const useStyles = makeStyles(() => ({
  arrow: {
    color: "#222",
  },
  tooltip: {
    fontSize: 12,
    backgroundColor: "#222",
  },
}));


export function HotbarSelector({ hotbar }: Props) {
  const store = HotbarStore.getInstance();
  const activeIndexDisplay = store.activeHotbarIndex + 1;
  const classes = useStyles();

  return (
    <div className="HotbarSelector flex align-center">
      <Icon material="play_arrow" className="previous box" onClick={() => store.switchToPrevious()} />
      <div className="box grow flex align-center">
        <Tooltip arrow title={hotbar.name} classes={classes}>
          <Badge
            id="hotbarIndex"
            small
            label={activeIndexDisplay}
            onClick={() => CommandOverlay.open(<HotbarSwitchCommand />)}
          />
        </Tooltip>
      </div>
      <Icon material="play_arrow" className="next box" onClick={() => store.switchToNext()} />
    </div>
  );
}
