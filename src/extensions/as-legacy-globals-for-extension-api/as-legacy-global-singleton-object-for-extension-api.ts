/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { asLegacyGlobalForExtensionApi } from "./as-legacy-global-object-for-extension-api";
import { getLegacyGlobalDiForExtensionApi } from "./legacy-global-di-for-extension-api";
import loggerInjectable from "../../common/logger.injectable";

export interface LegacySingleton<T> {
  createInstance(): T;
  getInstance(): T;
  resetInstance(): void;
}

export function asLegacyGlobalSingletonForExtensionApi<Instance>(injectable: Injectable<Instance, unknown, void>): LegacySingleton<Instance>;
export function asLegacyGlobalSingletonForExtensionApi<Instance, InstantiationParameter>(injectable: Injectable<Instance, unknown, InstantiationParameter>, param: InstantiationParameter): LegacySingleton<Instance>;

export function asLegacyGlobalSingletonForExtensionApi<Instance, InstantiationParameter>(
  injectable: Injectable<Instance, unknown, InstantiationParameter>,
  instantiationParameter?: InstantiationParameter,
): LegacySingleton<Instance> {
  const instance = asLegacyGlobalForExtensionApi(
    injectable as never,
    instantiationParameter,
  ) as Instance;

  return {
    createInstance: () => instance,

    getInstance: () => instance,

    resetInstance: () => {
      const di = getLegacyGlobalDiForExtensionApi();
      const logger = di.inject(loggerInjectable);

      logger.warn(
        `resetInstance() for a legacy global singleton of "${injectable.id}" does nothing.`,
      );
    },
  };
}
