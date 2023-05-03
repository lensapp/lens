/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";

import type {
  DragDropContextProps,
  DraggableProps,
  DraggableProvided,
  DraggableProvidedDraggableProps,
  DraggableStateSnapshot,
  DroppableProps,
  DroppableProvided,
  DroppableProvidedProps,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";

export const DragDropContext = ({ children }: DragDropContextProps) => <>{ children }</>;
export const Draggable = ({ children }: DraggableProps) => (
  <>
    {
      children(
        {
          draggableProps: {} as DraggableProvidedDraggableProps,
          innerRef: () => {},
        } as unknown as DraggableProvided,
        {
          isDragging: false,
          isDropAnimating: false,
        } as DraggableStateSnapshot,
        {
          draggableId: "some-mock-draggable-id",
          type: "FLUID",
          source: {
            droppableId: "some-mock-droppable-id",
            index: 0,
          },
        },
      )
    }
  </>
);
export const Droppable = ({ children }: DroppableProps) => (
  <>
    {
      children(
        {
          droppableProps: {} as DroppableProvidedProps,
          innerRef: () => {},
        } as unknown as DroppableProvided,
        {
          isDraggingOver: false,
          isUsingPlaceholder: false,
        } as DroppableStateSnapshot,
      )
    }
  </>
);
