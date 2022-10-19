/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// See: https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions
export interface Discriminable<T extends string> { kind: T }
