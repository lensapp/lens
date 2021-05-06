import "./hotbar-menu.scss";
import "./hotbar.commands";

import React from "react";
import { observer } from "mobx-react";
import { HotbarEntityIcon } from "./hotbar-entity-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { defaultHotbarCells, HotbarItem, HotbarStore } from "../../../common/hotbar-store";
import { catalogEntityRunContext } from "../../api/catalog-entity";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { HotbarSelector } from "./hotbar-selector";
import { HotbarCell } from "./hotbar-cell";
import { HotbarIcon } from "./hotbar-icon";

interface Props {
  className?: IClassName;
}

@observer
export class HotbarMenu extends React.Component<Props> {
  get hotbar() {
    return HotbarStore.getInstance().getActive();
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

  removeItem(uid: string) {
    const hotbar = HotbarStore.getInstance();

    hotbar.removeFromHotbar(uid);
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
              {item && (
                <Draggable draggableId={item.entity.uid} key={item.entity.uid} index={0} >
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
                        {entity ? (
                          <HotbarEntityIcon
                            key={index}
                            entity={entity}
                            onClick={() => entity?.onRun(catalogEntityRunContext)}
                            className={cssNames({ isDragging: snapshot.isDragging })}
                            remove={this.removeItem}
                          />
                        ) : (
                          <HotbarIcon
                            uid={item.entity.uid}
                            title={item.entity.name}
                            source={item.entity.source}
                            remove={this.removeItem}
                          />
                        )}
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
