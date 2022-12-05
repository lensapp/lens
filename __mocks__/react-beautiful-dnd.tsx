/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";

import type {
  DragDropContextProps,
  DraggableProps,
  DroppableProps,
} from "react-beautiful-dnd";

export const DragDropContext = ({ children }: DragDropContextProps) => <>{ children }</>;
export const Draggable = ({ children }: DraggableProps) => (
  <>
    {
      children(
        {
          draggableProps: {
            "data-rbd-draggable-context-id": "some-mock-rbd-draggable-context-id",
            "data-rbd-draggable-id": "some-mock-rbd-draggable-id",
          },
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
          droppableProps: {
            "data-rbd-droppable-context-id": "some-mock-rbd-droppable-context-id",
            "data-rbd-droppable-id": "some-mock-rbd-droppable-id",
          },
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
