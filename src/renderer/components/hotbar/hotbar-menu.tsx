import "./hotbar-menu.scss";
import "./hotbar.commands";

import React, { ReactNode, useState } from "react";
import { observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { HotbarItem, HotbarStore } from "../../../common/hotbar-store";
import { CatalogEntity, catalogEntityRunContext } from "../../api/catalog-entity";
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
  get hotbar() {
    return HotbarStore.getInstance().getActive();
  }

  isActive(item: CatalogEntity) {
    return catalogEntityRegistry.activeEntity?.metadata?.uid == item.getId();
  }

  getEntity(item: HotbarItem) {
    const hotbar = HotbarStore.getInstance().getActive();

    if (!hotbar) {
      return null;
    }

    return item ? catalogEntityRegistry.items.find((entity) => entity.metadata.uid === item.entity.uid) : null;
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

  renderGrid() {
    if (!this.hotbar.items.length) return;

    return this.hotbar.items.map((item, index) => {
      const entity = this.getEntity(item);

      return (
        <HotbarCell key={index} index={index}>
          {entity && (
            <HotbarIcon
              key={index}
              index={index}
              entity={entity}
              isActive={this.isActive(entity)}
              onClick={() => entity.onRun(catalogEntityRunContext)}
            />
          )}
        </HotbarCell>
      );
    });
  }

  render() {
    const { className } = this.props;
    const hotbarStore = HotbarStore.getInstance();
    const hotbar = hotbarStore.getActive();
    const activeIndexDisplay = hotbarStore.activeHotbarIndex + 1;

    return (
      <div className={cssNames("HotbarMenu flex column", className)}>
        <div className="HotbarItems flex column gaps">
          {this.renderGrid()}
        </div>
        <div className="HotbarSelector flex align-center">
          <Icon material="play_arrow" className="previous box" onClick={() => this.previous()} />
          <div className="box grow flex align-center">
            <Badge id="hotbarIndex" small label={activeIndexDisplay} onClick={() => this.openSelector()} />
            <Tooltip
              targetId="hotbarIndex"
              preferredPositions={TooltipPosition.TOP}
            >
              {hotbar.name}
            </Tooltip>
          </div>
          <Icon material="play_arrow" className="next box" onClick={() => this.next()} />
        </div>
      </div>
    );
  }
}

interface HotbarCellProps {
  children?: ReactNode;
  index: number;
}

function HotbarCell(props: HotbarCellProps) {
  const [animating, setAnimating] = useState(false);
  const onAnimationEnd = () => { setAnimating(false); };
  const onClick = () => { setAnimating(true); };

  return (
    <div
      className={cssNames("HotbarCell", { animating })}
      onAnimationEnd={onAnimationEnd}
      onClick={onClick}
    >
      {props.children}
    </div>
  );
}
