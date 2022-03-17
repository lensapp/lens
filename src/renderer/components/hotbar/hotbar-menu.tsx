/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./hotbar-menu.scss";

import React from "react";
import { observer } from "mobx-react";
import { HotbarEntityIcon } from "./hotbar-entity-icon";
import type { IClassName } from "../../utils";
import { cssNames } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import type { CatalogEntity } from "../../api/catalog-entity";
import { DragDropContext, Draggable, Droppable, type DropResult } from "react-beautiful-dnd";
import { HotbarSelector } from "./hotbar-selector";
import { HotbarCell } from "./hotbar-cell";
import { HotbarIcon } from "./hotbar-icon";
import type { HotbarItem } from "../../../common/hotbar-types";
import { defaultHotbarCells } from "../../../common/hotbar-types";
import { action, makeObservable, observable } from "mobx";
import hotbarStoreInjectable from "../../../common/hotbar-store.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { HotbarStore } from "../../../common/hotbar-store";

export interface HotbarMenuProps {
  className?: IClassName;
}

interface Dependencies {
  hotbarStore: HotbarStore;
}

@observer
class NonInjectedHotbarMenu extends React.Component<Dependencies & HotbarMenuProps> {
  @observable draggingOver = false;

  constructor(props: Dependencies & HotbarMenuProps) {
    super(props);
    makeObservable(this);
  }

  get hotbar() {
    return this.props.hotbarStore.getActive();
  }

  getEntity(item: HotbarItem | null) {
    const hotbar = this.props.hotbarStore.getActive();

    if (!hotbar || !item) {
      return null;
    }

    return catalogEntityRegistry.getById(item.entity.uid) ?? null;
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

    this.props.hotbarStore.restackItems(from, to);
  }

  removeItem = (uid: string) => {
    const hotbar = this.props.hotbarStore;

    hotbar.removeFromHotbar(uid);
  };

  addItem = (entity: CatalogEntity, index = -1) => {
    const hotbar = this.props.hotbarStore;

    hotbar.addToHotbar(entity, index);
  };

  getMoveAwayDirection(entityId: string | undefined, cellIndex: number) {
    if (!entityId) {
      return "animateDown";
    }

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
                <Draggable
                  draggableId={item.entity.uid}
                  key={item.entity.uid}
                  index={0} 
                >
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
                            source={item.entity.source ?? "local"}
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
    const { className, hotbarStore } = this.props;
    const hotbar = hotbarStore.getActive();

    return (
      <div className={cssNames("HotbarMenu flex column", { draggingOver: this.draggingOver }, className)}>
        <div className="HotbarItems flex column gaps">
          <DragDropContext onDragStart={() => this.onDragStart()} onDragEnd={(result) => this.onDragEnd(result)}>
            {this.renderGrid()}
          </DragDropContext>
        </div>
        <HotbarSelector hotbar={hotbar} />
      </div>
    );
  }
}

export const HotbarMenu = withInjectables<Dependencies, HotbarMenuProps>(
  NonInjectedHotbarMenu,

  {
    getProps: (di, props) => ({
      hotbarStore: di.inject(hotbarStoreInjectable),
      ...props,
    }),
  },
);
