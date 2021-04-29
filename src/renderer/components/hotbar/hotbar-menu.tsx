import "./hotbar-menu.scss";
import "./hotbar.commands";

import React, { HTMLAttributes, ReactNode, useState } from "react";
import { observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { HotbarItem, HotbarStore } from "../../../common/hotbar-store";
import { CatalogEntity, catalogEntityRunContext } from "../../api/catalog-entity";
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

  onDragEnd() {
    console.log("drag end")
  }

  renderGrid() {
    return this.hotbar.items.map((item, index) => {
      const entity = this.getEntity(item);

      return (
        <Droppable droppableId={`droppable-${index}`} key={index} isCombineEnabled>
          {(provided, snapshot) => (
            <HotbarCell
              index={index}
              ref={provided.innerRef}
              style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : 'grey' }}
              {...provided.droppableProps}
            >
              {entity && (
                <Draggable draggableId={`draggable-${index}`} index={0}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <HotbarIcon
                        key={index}
                        index={index}
                        entity={entity}
                        isActive={this.isActive(entity)}
                        onClick={() => entity.onRun(catalogEntityRunContext)}
                      />
                    </div>
                  )}
                </Draggable>
              )}
            </HotbarCell>
          )}
        </Droppable>
      );
    });
  }

  render() {
    const { className } = this.props;
    const hotbarStore = HotbarStore.getInstance();
    const hotbar = hotbarStore.getActive();

    return (
      <div className={cssNames("HotbarMenu flex column", className)}>
        <div className="HotbarItems flex column gaps">
          <DragDropContext onDragEnd={this.onDragEnd}>
            {this.renderGrid()}
          </DragDropContext>
        </div>
        <HotbarSelector hotbar={hotbar}/>
      </div>
    );
  }
}

interface HotbarCellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  index: number;
  ref?: any;
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
