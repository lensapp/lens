/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./hotbar-menu.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import { HotbarEntityIcon } from "./hotbar-entity-icon";
import { cssNames, IClassName } from "../../utils";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { HotbarSelector } from "./hotbar-selector";
import { HotbarCell } from "./hotbar-cell";
import { HotbarIcon } from "./hotbar-icon";
import { defaultHotbarCells, HotbarItem } from "../../../common/hotbar-store/hotbar-types";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogEntityRegistryInjectable from "../../catalog/entity-registry.injectable";
import activeHotbarInjectable from "../../../common/hotbar-store/active-hotbar.injectable";
import type { CatalogEntity } from "../../../common/catalog";
import onRunInjectable from "../../catalog/on-run.injectable";
import getEntityByIdInjectable from "../../catalog/get-entity-by-id.injectable";
import type { Hotbar } from "../../../common/hotbar-store/hotbar";

export interface HotbarMenuProps {
  className?: IClassName;
}

interface Dependencies {
  activeHotbar: IComputedValue<Hotbar>;
  onRun: (entity: CatalogEntity) => void;
  getEntityById: (id: string) => CatalogEntity;
}

const NonInjectedHotbarMenu = observer(({ activeHotbar, onRun, getEntityById, className }: Dependencies & HotbarMenuProps) => {
  const [draggingOver, setDraggingOver] = useState(false);
  const hotbar = activeHotbar.get();

  const getEntity = (item: HotbarItem) => {
    return getEntityById(item?.entity.uid) ?? null;
  };
  const onDragStart = () => setDraggingOver(true);
  const onDragEnd = ({ source, destination }: DropResult) => {
    setDraggingOver(false);

    if (!destination) {
      // Dropped outside of the list
      return;
    }

    const from = parseInt(source.droppableId);
    const to = parseInt(destination.droppableId);

    hotbar.restackItems(from, to);
  };

  const removeItemById = (id: string) => {
    hotbar.removeItemById(id);
  };

  const getMoveAwayDirection = (entityId: string, cellIndex: number) => {
    const draggableItemIndex = hotbar.items.findIndex(item => item?.entity.uid == entityId);

    return draggableItemIndex > cellIndex ? "animateDown" : "animateUp";
  };

  const renderGrid = () => {
    return hotbar.items.map((item, index) => {
      const entity = getEntity(item);

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
              }, getMoveAwayDirection(snapshot.draggingOverWith, index))}
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
                            onClick={() => onRun(entity)}
                            className={cssNames({ isDragging: snapshot.isDragging })}
                            removeById={removeItemById}
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
                                onClick: () => removeItemById(item.entity.uid),
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
  };

  return (
    <div className={cssNames("HotbarMenu flex column", { draggingOver }, className)}>
      <div className="HotbarItems flex column gaps">
        <DragDropContext onDragStart={() => onDragStart()} onDragEnd={(result) => onDragEnd(result)}>
          {renderGrid()}
        </DragDropContext>
      </div>
      <HotbarSelector hotbar={hotbar}/>
    </div>
  );
});

export const HotbarMenu = withInjectables<Dependencies, HotbarMenuProps>(NonInjectedHotbarMenu, {
  getProps: (di, props) => ({
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
    activeHotbar: di.inject(activeHotbarInjectable),
    onRun: di.inject(onRunInjectable),
    getEntityById: di.inject(getEntityByIdInjectable),
    ...props,
  }),
});

