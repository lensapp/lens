/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Type guard for checking valid react node to use in render
import React, { ReactNode } from "react";

export function isReactNode(node: ReactNode): node is ReactNode {
  return React.isValidElement(node)
    || Array.isArray(node) && node.every(isReactNode)
    || node == null
    || typeof node !== "object";
}
