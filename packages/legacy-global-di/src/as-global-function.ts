/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getLegacyGlobalDiForExtensionApi } from "./global-di";
import type { Inject } from "@ogre-tools/injectable";

export const asLegacyGlobalFunctionForExtensionApi = ((injectableKey, instantiationParameter) =>
  (...args: unknown[]) => {
    const injected = getLegacyGlobalDiForExtensionApi().inject(injectableKey, instantiationParameter) as unknown as (
      ...args: unknown[]
    ) => unknown;

    return injected(...args);
  }) as Inject;
