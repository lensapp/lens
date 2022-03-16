/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Inject } from "@ogre-tools/injectable";
import { getLegacyGlobalDiForExtensionApi } from "./legacy-global-di-for-extension-api";

export const asLegacyGlobalForExtensionApi = ((
  injectable,
  instantiationParameter,
) =>
  new Proxy(
    {},

    {
      apply(target: any, thisArg, argArray) {
        const fn = getLegacyGlobalDiForExtensionApi().inject(
          injectable,
          instantiationParameter,
        ) as unknown as (...args: any[]) => any;

        return fn(...argArray);
      },

      get(target, propertyName) {
        if (propertyName === "$$typeof") {
          return undefined;
        }

        const instance: any = getLegacyGlobalDiForExtensionApi().inject(
          injectable,
          instantiationParameter,
        );

        const propertyValue = instance[propertyName] ?? target[propertyName];

        if (typeof propertyValue === "function") {
          return function (...args: any[]) {
            return propertyValue.apply(instance, args);
          };
        }

        return propertyValue;
      },
    },
  )) as Inject<false>;
