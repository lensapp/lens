/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Type guard for checking valid react node to use in render
import type { ReactNode } from "react";
import React from "react";
import { isObject } from "../../common/utils";

export function isReactNode(node: unknown): node is ReactNode {
  return (isObject(node) && React.isValidElement(node))
    || Array.isArray(node) && node.every(isReactNode)
    || node == null
    || typeof node !== "object";
}
