/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { isObject } from "./type-narrowing";
import type { SingleOrMany } from "./types";

export type SafeReactNode = React.ReactElement | React.ReactText | boolean | null | undefined | Iterable<SafeReactNode>;

export function toSafeReactChildrenArray(children: SingleOrMany<SafeReactNode>) {
  return React.Children.toArray(children) as (Exclude<SafeReactNode, boolean | null | undefined>)[];
}

export function isReactNode(node: unknown): node is SafeReactNode {
  return (isObject(node) && React.isValidElement(node))
    || Array.isArray(node) && node.every(isReactNode)
    || node == null
    || typeof node !== "object";
}
