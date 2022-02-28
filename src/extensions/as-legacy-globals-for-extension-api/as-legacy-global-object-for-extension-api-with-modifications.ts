/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable, TentativeTuple } from "@ogre-tools/injectable";
import { getLegacyGlobalDiForExtensionApi } from "./legacy-global-di-for-extension-api";

type MapInjectables<T> = {
  [Key in keyof T]: T[Key] extends () => infer Res ? Res : never;
};

export const asLegacyGlobalObjectForExtensionApiWithModifications = <
  TInjectable extends Injectable<unknown, unknown, TInstantiationParameter>,
  TInstantiationParameter,
  OtherFields extends Record<string, () => any>,
>(
    injectableKey: TInjectable,
    otherFields: OtherFields,
    ...instantiationParameter: TentativeTuple<TInstantiationParameter>
  ) =>
  new Proxy(
    {},
    {
      get(target, propertyName) {
        if (propertyName === "$$typeof") {
          return undefined;
        }

        const instance: any = getLegacyGlobalDiForExtensionApi().inject(
          injectableKey,
          ...instantiationParameter,
        );

        const propertyValue = instance[propertyName] ?? otherFields[propertyName as any]();

        if (typeof propertyValue === "function") {
          return function (...args: any[]) {
            return propertyValue.apply(instance, args);
          };
        }

        return propertyValue;
      },
    },
  ) as ReturnType<TInjectable["instantiate"]> & MapInjectables<OtherFields>;
