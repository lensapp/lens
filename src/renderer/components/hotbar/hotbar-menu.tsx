import "./hotbar-menu.scss";
import "./hotbar.commands";

import React, { ReactNode, useState } from "react";
import { observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { defaultHotbarCells, HotbarItem, HotbarStore } from "../../../common/hotbar-store";
import { CatalogEntity, catalogEntityRunContext } from "../../api/catalog-entity";
import { Icon } from "../icon";
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from "react-beautiful-dnd";
import { HotbarSelector } from "./hotbar-selector";

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

  renderAddCellButton() {
    return (
      <button className="AddCellButton" onClick={() => HotbarStore.getInstance().addEmptyCell()}>
        <Icon material="add"/>
      </button>
    );
  }

  render() {
    const { className } = this.props;
    const hotbarStore = HotbarStore.getInstance();
    const hotbar = hotbarStore.getActive();

    return (
      <div className={cssNames("HotbarMenu flex column", className)}>
        <div className="HotbarItems flex column gaps">
          {this.renderGrid()}
          {this.hotbar.items.length != defaultHotbarCells && this.renderAddCellButton()}
        </div>
        <HotbarSelector hotbar={hotbar}/>
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
  const onDeleteClick = (evt: Event | React.SyntheticEvent) => {
    evt.stopPropagation();
    HotbarStore.getInstance().removeEmptyCell(props.index);
  };

  return (
    <div
      className={cssNames("HotbarCell", { animating, empty: !props.children })}
      onAnimationEnd={onAnimationEnd}
      onClick={onClick}
    >
      {props.children}
      {!props.children && (
        <div className="cellDeleteButton" onClick={onDeleteClick}>
          <Icon material="close" smallest/>
        </div>
      )}
    </div>
  );
}
