import "./hotbar-menu.scss";
import "./hotbar.commands";

import React from "react";
import { observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { HotbarStore } from "../../../common/hotbar-store";
import { catalogEntityRunContext } from "../../api/catalog-entity";
import { Icon } from "../icon";
import { Badge } from "../badge";
import { CommandOverlay } from "../command-palette";
import { HotbarSwitchCommand } from "./hotbar-switch-command";
import { Tooltip, TooltipPosition } from "../tooltip";

interface Props {
  className?: IClassName;
}

@observer
export class HotbarMenu extends React.Component<Props> {
  get hotbarItems() {
    const hotbar = HotbarStore.getInstance().getActive();

    if (!hotbar) {
      return [];
    }

    return hotbar.items.map((item) => catalogEntityRegistry.items.find((entity) => entity.metadata.uid === item.entity.uid)).filter(Boolean);
  }

  previous() {
    HotbarStore.getInstance().switchToPrevious();
  }

  next() {
    HotbarStore.getInstance().switchToNext();
  }

  openSelector() {
    CommandOverlay.open(<HotbarSwitchCommand />);
  }

  render() {
    const { className } = this.props;
    const hotbarStore = HotbarStore.getInstance();
    const hotbar = hotbarStore.getActive();
    const activeIndexDisplay = hotbarStore.activeHotbarIndex + 1;

    return (
      <div className={cssNames("HotbarMenu flex column", className)}>
        <div className="items flex column gaps">
          {this.hotbarItems.map((entity, index) => {
            return (
              <HotbarIcon
                key={index}
                index={index}
                entity={entity}
                isActive={entity.status.active}
                onClick={() => entity.onRun(catalogEntityRunContext)}
              />
            );
          })}
        </div>
        <div className="HotbarSelector flex gaps auto">
          <Icon material="chevron_left" className="previous box" onClick={() => this.previous()} />
          <div className="box">
            <Badge id="hotbarIndex" small label={activeIndexDisplay} onClick={() => this.openSelector()} />
            <Tooltip
              targetId="hotbarIndex"
              preferredPositions={TooltipPosition.TOP}
            >
              {hotbar.name}
            </Tooltip>
          </div>
          <Icon material="chevron_right" className="next box" onClick={() => this.next()} />
        </div>
      </div>
    );
  }
}
