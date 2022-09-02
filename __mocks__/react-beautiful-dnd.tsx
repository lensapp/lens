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
export const Draggable = ({ children }: DraggableProps) => <>{ children }</>;
export const Droppable = ({ children }: DroppableProps) => <>{ children }</>;
