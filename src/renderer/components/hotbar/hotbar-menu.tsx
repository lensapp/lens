/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./hotbar-menu.scss";

import React from "react";
import { observer } from "mobx-react";
import { HotbarEntityIcon } from "./hotbar-entity-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { HotbarStore } from "../../../common/hotbar-store";
import type { CatalogEntity } from "../../api/catalog-entity";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { HotbarSelector } from "./hotbar-selector";
import { HotbarCell } from "./hotbar-cell";
import { HotbarIcon } from "./hotbar-icon";
import { defaultHotbarCells, HotbarItem } from "../../../common/hotbar-types";
import { action, makeObservable, observable } from "mobx";

interface Props {
  className?: IClassName;
}

@observer
export class HotbarMenu extends React.Component<Props> {
  @observable draggingOver = false;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  get hotbar() {
    return HotbarStore.getInstance().getActive();
  }

  getEntity(item: HotbarItem) {
    const hotbar = HotbarStore.getInstance().getActive();

    if (!hotbar) {
      return null;
    }

    return catalogEntityRegistry.getById(item?.entity.uid) ?? null;
  }

  @action
  onDragStart() {
    this.draggingOver = true;
  }

  @action
  onDragEnd(result: DropResult) {
    const { source, destination } = result;

    this.draggingOver = false;

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

  addItem(entity: CatalogEntity, index = -1) {
    const hotbar = HotbarStore.getInstance();

    hotbar.addToHotbar(entity, index);
  }

  getMoveAwayDirection(entityId: string, cellIndex: number) {
    const draggableItemIndex = this.hotbar.items.findIndex(item => item?.entity.uid == entityId);

    return draggableItemIndex > cellIndex ? "animateDown" : "animateUp";
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
              className={cssNames({
                isDraggingOver: snapshot.isDraggingOver,
                isDraggingOwner: snapshot.draggingOverWith == entity?.getId(),
              }, this.getMoveAwayDirection(snapshot.draggingOverWith, index))}
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
                            index={index}
                            entity={entity}
                            onClick={() => catalogEntityRegistry.onRun(entity)}
                            className={cssNames({ isDragging: snapshot.isDragging })}
                            remove={this.removeItem}
                            add={this.addItem}
                            size={40}
                          />
                        ) : (
                          <HotbarIcon
                            uid={`hotbar-icon-${item.entity.uid}`}
                            title={item.entity.name}
                            source={item.entity.source}
                            tooltip={`${item.entity.name} (${item.entity.source})`}
                            menuItems={[
                              {
                                title: "Remove from Hotbar",
                                onClick: () => this.removeItem(item.entity.uid),
                              },
                            ]}
                            disabled
                            size={40}
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
      <div className={cssNames("HotbarMenu flex column", { draggingOver: this.draggingOver }, className)}>
        <div className="HotbarItems flex column gaps">
          <DragDropContext onDragStart={() => this.onDragStart()} onDragEnd={(result) => this.onDragEnd(result)}>
            {this.renderGrid()}
          </DragDropContext>
        </div>
        <HotbarSelector hotbar={hotbar}/>
      </div>
    );
  }
}
