/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Inject } from "@ogre-tools/injectable";
import { getLegacyGlobalDiForExtensionApi } from "./global-di";

export const asLegacyGlobalForExtensionApi = ((injectable, instantiationParameter) =>
  new Proxy(
    {},

    {
      apply(target: unknown, thisArg, argArray: unknown[]) {
        const fn = getLegacyGlobalDiForExtensionApi().inject(injectable, instantiationParameter) as unknown as (
          ...args: unknown[]
        ) => unknown;

        return fn(...argArray);
      },

      get(target: Record<string | symbol, unknown>, propertyName) {
        if (propertyName === "$$typeof") {
          return undefined;
        }

        const instance = getLegacyGlobalDiForExtensionApi().inject(injectable, instantiationParameter) as Record<
          string | symbol,
          unknown
        >;

        const propertyValue = instance[propertyName] ?? target[propertyName];

        if (typeof propertyValue === "function") {
          return function (...args: unknown[]) {
            return propertyValue.apply(instance, args) as unknown;
          };
        }

        return propertyValue;
      },
    },
  )) as Inject;
