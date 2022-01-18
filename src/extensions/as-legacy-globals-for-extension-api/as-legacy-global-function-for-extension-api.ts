/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";

import { getLegacyGlobalDiForExtensionApi } from "./legacy-global-di-for-extension-api";

type TentativeTuple<T> = T extends object ? [T] : [undefined?];

type FactoryType = <
  TInjectable extends Injectable<unknown, TInstance, TInstantiationParameter>,
  TInstantiationParameter,
  TInstance extends (...args: unknown[]) => any,
  TFunction extends (...args: unknown[]) => any = Awaited<
    ReturnType<TInjectable["instantiate"]>
  >,
>(
  injectableKey: TInjectable,
  ...instantiationParameter: TentativeTuple<TInstantiationParameter>
) => (...args: Parameters<TFunction>) => ReturnType<TFunction>;

export const asLegacyGlobalFunctionForExtensionApi: FactoryType =
  (injectableKey, ...instantiationParameter) =>
    (...args) => {
      const injected = getLegacyGlobalDiForExtensionApi().inject(
        injectableKey,
        ...instantiationParameter,
      );

      return injected(...args);
    };
