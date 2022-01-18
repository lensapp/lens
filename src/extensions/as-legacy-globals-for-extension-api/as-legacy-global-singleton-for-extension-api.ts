/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getLegacyGlobalDiForExtensionApi } from "./legacy-global-di-for-extension-api";

type TentativeTuple<T> = T extends object ? [T] : [undefined?];

export const asLegacyGlobalSingletonForExtensionApi = <
  TClass extends abstract new (...args: any[]) => any,
  TInjectable extends Injectable<unknown, unknown, TInstantiationParameter>,
  TInstantiationParameter,
>(
    Class: TClass,
    injectableKey: TInjectable,
    ...instantiationParameter: TentativeTuple<TInstantiationParameter>
  ) =>
  new Proxy(Class, {
    construct: () => {
      throw new Error("A legacy singleton class must be created by createInstance()");
    },

    get: (target: any, propertyName) => {
      if (propertyName === "getInstance" || propertyName === "createInstance") {
        return () =>
          getLegacyGlobalDiForExtensionApi().inject(
            injectableKey,
            ...instantiationParameter,
          );
      }

      if (propertyName === "resetInstance") {
        return () => getLegacyGlobalDiForExtensionApi().purge(injectableKey);
      }

      return target[propertyName];
    },
  }) as InstanceType<TClass> & {
    getInstance: () => InstanceType<TClass>;
    createInstance: () => InstanceType<TClass>;
    resetInstance: () => void;
  };
