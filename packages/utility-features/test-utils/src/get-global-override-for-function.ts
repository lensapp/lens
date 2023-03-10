/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getGlobalOverride } from "./get-global-override";
import { camelCase } from "lodash/fp";

export const getGlobalOverrideForFunction = (injectable: Injectable<Function, any, any>) => (
  getGlobalOverride(injectable, () => (...args: any[]) => {
    console.warn(
      `Tried to invoke a function "${injectable.id}" without override. The args were:`,
      args,
    );

    throw new Error(
      `Tried to invoke a function "${injectable.id}" without override. Add eg. "di.override(${camelCase(injectable.id)}Mock)" to the unit test interested in this.`,
    );
  })
);
