import "./hotbar-selector.scss";
import { Icon } from "../icon";
import { Badge } from "../badge";
import { Tooltip } from "@material-ui/core";
import { Hotbar, HotbarStore } from "../../../common/hotbar-store";
import { CommandOverlay } from "../command-palette";
import { HotbarSwitchCommand } from "./hotbar-switch-command";

interface Props {
  hotbar: Hotbar;
}

const store = HotbarStore.getInstance();

export function HotbarSelector({ hotbar }: Props) {
  const activeIndexDisplay = store.activeHotbarIndex + 1;

  return (
    <div className="HotbarSelector flex align-center">
      <Icon material="play_arrow" className="previous box" onClick={() => store.switchToPrevious()} />
      <div className="box grow flex align-center">
        <Tooltip arrow title={hotbar.name}>
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
