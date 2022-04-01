/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { asLegacyGlobalForExtensionApi } from "./as-legacy-global-object-for-extension-api";
import { getLegacyGlobalDiForExtensionApi } from "./legacy-global-di-for-extension-api";
import loggerInjectable from "../../common/logger.injectable";

export const asLegacyGlobalSingletonForExtensionApi = <
  Instance,
  InstantiationParameter = void,
>(
    injectable: Injectable<Instance, unknown, InstantiationParameter>,
    instantiationParameter?: InstantiationParameter,
  ) => {
  const instance = asLegacyGlobalForExtensionApi(
    injectable,
    instantiationParameter,
  );

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
};
