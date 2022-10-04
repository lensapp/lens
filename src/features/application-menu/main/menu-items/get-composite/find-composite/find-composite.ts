/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Composite } from "../get-composite";
import { normalizeComposite } from "../normalize-composite/normalize-composite";

export const findComposite =
  (path: string) =>
  <T>(composite: Composite<T>): Composite<T> | undefined =>
      new Map(normalizeComposite(composite)).get(path);
