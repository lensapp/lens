/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";

/**
 * Returns `true` if `node` is a falsy value
 */
export function isNodeFalsy(node: React.ReactNode): boolean {
  return !isNodeRenderable(node);
}

/**
 * Return `true` if React would render this
 */
export function isNodeRenderable(node: React.ReactNode): boolean {
  return Boolean(node);
}

/**
 * Returns the first react node provided that is would be rendered by react
 */
export function foldNodes(...nodes: React.ReactNode[]): React.ReactNode {
  return nodes.find(isNodeRenderable);
}
