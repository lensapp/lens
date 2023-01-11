/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { map } from "lodash/fp";
import type { Composite } from "../get-composite/get-composite";
import { getCompositeNormalization } from "../get-composite-normalization/get-composite-normalization";

export const getCompositePaths = (
  composite: Composite<unknown>,
): string[][] => pipeline(composite, getCompositeNormalization, map(([path]) => path));
