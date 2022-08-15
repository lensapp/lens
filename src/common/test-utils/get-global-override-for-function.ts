/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getGlobalOverride } from "./get-global-override";

export const getGlobalOverrideForFunction = (
  injectable: Injectable<Function, any, any>,
) =>
  getGlobalOverride(injectable, () => () => {
    throw new Error(`Tried to invoke a function "${injectable.id}" without override`);
  });
