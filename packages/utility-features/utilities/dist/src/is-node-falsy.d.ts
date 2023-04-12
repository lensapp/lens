/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type React from "react";
/**
 * Returns `true` if `node` is a falsy value
 */
export declare function isNodeFalsy(node: React.ReactNode): boolean;
/**
 * Return `true` if React would render this
 */
export declare function isNodeRenderable(node: React.ReactNode): boolean;
/**
 * Returns the first react node provided that is would be rendered by react
 */
export declare function foldNodes(...nodes: React.ReactNode[]): React.ReactNode;
