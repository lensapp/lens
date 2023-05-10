/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./hotbar-menu.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import { HotbarEntityIcon } from "./hotbar-entity-icon";
import type { IClassName, StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import type { CatalogEntityRegistry } from "../../api/catalog/entity/registry";
import type { CatalogEntity } from "../../api/catalog-entity";
import { DragDropContext, Draggable, Droppable, type DropResult } from "react-beautiful-dnd";
import { HotbarSelector } from "./hotbar-selector";
import { HotbarCell } from "./hotbar-cell";
import { HotbarIcon } from "./hotbar-icon";
import type { HotbarItem } from "../../../features/hotbar/storage/common/types";
import { defaultHotbarCells } from "../../../features/hotbar/storage/common/types";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import type { Hotbar } from "../../../features/hotbar/storage/common/hotbar";
import activeHotbarInjectable from "../../../features/hotbar/storage/common/active.injectable";

export interface HotbarMenuProps {
  className?: IClassName;
}

interface Dependencies {
  activeHotbar: IComputedValue<Hotbar | undefined>;
  entityRegistry: CatalogEntityRegistry;
}

const NonInjectedHotbarMenu = observer((props: Dependencies & HotbarMenuProps) => {
  const {
    activeHotbar,
    entityRegistry,
    className,
  } = props;

  const [draggingOver, setDraggingOver] = useState(false);
  const hotbar = activeHotbar.get();

  const getEntity = (item: HotbarItem | null) => {
    if (!item) {
      return undefined;
    }

    return entityRegistry.getById(item.entity.uid);
  };
  const onDragStart = () => setDraggingOver(true);
  const onDragEnd = (result: DropResult) => {
    setDraggingOver(false);

    const { source, destination } = result;

    if (!destination) {  // Dropped outside of the list
      return;
    }

    const from = parseInt(source.droppableId);
    const to = parseInt(destination.droppableId);

    hotbar?.restack(from, to);
  };
  const removeItem = (entityId: string) => {
    hotbar?.removeEntity(entityId);
  };
  const addItem = (entity: CatalogEntity) => {
    hotbar?.addEntity(entity);
  };
  const getMoveAwayDirection = (entityId: string | undefined | null, cellIndex: number) => {
    if (!entityId || !hotbar) {
      return "animateDown";
    }

    const draggableItemIndex = hotbar.items.findIndex(item => item?.entity.uid == entityId);

    return draggableItemIndex > cellIndex ? "animateDown" : "animateUp";
  };

  const renderGrid = () => hotbar?.items.map((item, index) => {
    const entity = getEntity(item);

    return (
      <Droppable droppableId={`${index}`} key={index}>
        {(provided, snapshot) => (
          <HotbarCell
            index={index}
            key={entity ? entity.getId() : `cell${index}`}
            innerRef={provided.innerRef}
            className={cssNames(
              {
                isDraggingOver: snapshot.isDraggingOver,
                isDraggingOwner: snapshot.draggingOverWith == entity?.getId(),
              },
              getMoveAwayDirection(snapshot.draggingOverWith, index),
            )}
            {...provided.droppableProps}
          >
            {item && (
              <Draggable
                draggableId={item.entity.uid}
                key={item.entity.uid}
                index={0}
              >
                {(provided, snapshot) => (
                  <div
                    key={item.entity.uid}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      zIndex: defaultHotbarCells - index,
                      position: "absolute" as const,
                      ...provided.draggableProps.style,
                    }}
                  >
                    {entity ? (
                      <HotbarEntityIcon
                        key={index}
                        index={index}
                        entity={entity}
                        onClick={() => entityRegistry.onRun(entity)}
                        className={cssNames({ isDragging: snapshot.isDragging })}
                        remove={removeItem}
                        add={addItem}
                        size={40} />
                    ) : (
                      <HotbarIcon
                        uid={`hotbar-icon-${item.entity.uid}`}
                        title={item.entity.name}
                        source={item.entity.source ?? "local"}
                        tooltip={`${item.entity.name} (${item.entity.source})`}
                        menuItems={[
                          {
                            title: "Remove from Hotbar",
                            onClick: () => removeItem(item.entity.uid),
                          },
                        ]}
                        disabled
                        size={40} />
                    )}
                  </div>
                )}
              </Draggable>
            )}
            {provided.placeholder as StrictReactNode}
          </HotbarCell>
        )}
      </Droppable>
    );
  });

  return (
    <div className={cssNames("HotbarMenu flex column", { draggingOver }, className)}>
      <div className="HotbarItems flex column gaps">
        <DragDropContext
          onDragStart={() => onDragStart()}
          onDragEnd={(result) => onDragEnd(result)}>
          {renderGrid()}
        </DragDropContext>
      </div>
      <HotbarSelector />
    </div>
  );
});

export const HotbarMenu = withInjectables<Dependencies, HotbarMenuProps>(NonInjectedHotbarMenu, {
  getProps: (di, props) => ({
    ...props,
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
    activeHotbar: di.inject(activeHotbarInjectable),
  }),
});
