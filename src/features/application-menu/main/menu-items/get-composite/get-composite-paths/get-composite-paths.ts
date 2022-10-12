/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { map } from "lodash/fp";
import type { Composite } from "../get-composite";
import { normalizeComposite } from "../normalize-composite/normalize-composite";

export const getCompositePaths = (
  composite: Composite<unknown>,
): string[] => pipeline(composite, normalizeComposite, map(([path]) => path));
