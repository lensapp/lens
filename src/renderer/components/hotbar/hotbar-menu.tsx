import "./hotbar-menu.scss";
import "./hotbar.commands";

import React, { HTMLAttributes, ReactNode, useState } from "react";
import { observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { defaultHotbarCells, HotbarItem, HotbarStore } from "../../../common/hotbar-store";
import { CatalogEntity, catalogEntityRunContext } from "../../api/catalog-entity";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
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

  onDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (!destination) {  // Dropped outside of the list
      return;
    }

    const from = parseInt(source.droppableId);
    const to = parseInt(destination.droppableId);

    HotbarStore.getInstance().restackItems(from, to);
  }

  renderGrid() {
    return this.hotbar.items.map((item, index) => {
      const entity = this.getEntity(item);

      return (
        <Droppable droppableId={`${index}`} key={index}>
          {(provided, snapshot) => (
            <HotbarCell
              index={index}
              key={entity ? entity.getId() : `cell${index}`}
              innerRef={provided.innerRef}
              className={cssNames({ isDraggingOver: snapshot.isDraggingOver })}
              {...provided.droppableProps}
            >
              {entity && (
                <Draggable draggableId={item.entity.uid} key={item.entity.uid} index={0}>
                  {(provided, snapshot) => {
                    const style = {
                      zIndex: defaultHotbarCells - index,
                      position: "absolute",
                      ...provided.draggableProps.style,
                    } as React.CSSProperties;

                    return (
                      <div
                        key={item.entity.uid}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={style}
                      >
                        <HotbarIcon
                          key={index}
                          index={index}
                          entity={entity}
                          isActive={this.isActive(entity)}
                          onClick={() => entity.onRun(catalogEntityRunContext)}
                          className={cssNames({ isDragging: snapshot.isDragging })}
                        />
                      </div>
                    );
                  }}
                </Draggable>
              )}
              {provided.placeholder}
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
  innerRef?: React.LegacyRef<HTMLDivElement>;
}

function HotbarCell({ innerRef, children, className, ...rest }: HotbarCellProps) {
  const [animating, setAnimating] = useState(false);
  const onAnimationEnd = () => { setAnimating(false); };
  const onClick = () => {
    if (className.includes("isDraggingOver")) {
      return;
    }

    setAnimating(true);
  };

  return (
    <div
      className={cssNames("HotbarCell", { animating }, className)}
      onAnimationEnd={onAnimationEnd}
      onClick={onClick}
      ref={innerRef}
      {...rest}
    >
      {children}
    </div>
  );
}
