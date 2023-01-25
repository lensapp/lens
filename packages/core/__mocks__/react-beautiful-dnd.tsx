/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";

import type {
  DragDropContextProps,
  DraggableProps,
  DraggableProvidedDraggableProps,
  DroppableProps,
  DroppableProvidedProps,
} from "react-beautiful-dnd";

export const DragDropContext = ({ children }: DragDropContextProps) => <>{ children }</>;
export const Draggable = ({ children }: DraggableProps) => (
  <>
    {
      children(
        {
          draggableProps: {} as DraggableProvidedDraggableProps,
          innerRef: () => {},
        },
        {
          isDragging: false,
          isDropAnimating: false,
        },
        {
          draggableId: "some-mock-draggable-id",
          mode: "FLUID",
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
        },
        {
          isDraggingOver: false,
          isUsingPlaceholder: false,
        },
      )
    }
  </>
);
