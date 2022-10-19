/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Composite } from "../get-composite";
import { getCompositeNormalization } from "../get-composite-normalization/get-composite-normalization";

export const findComposite =
  (path: string) =>
  <T>(composite: Composite<T>): Composite<T> | undefined =>
      new Map(getCompositeNormalization(composite)).get(path);
