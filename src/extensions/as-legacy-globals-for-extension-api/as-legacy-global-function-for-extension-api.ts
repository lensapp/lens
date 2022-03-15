/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getLegacyGlobalDiForExtensionApi } from "./legacy-global-di-for-extension-api";
import type { Inject } from "@ogre-tools/injectable";

export const asLegacyGlobalFunctionForExtensionApi = ((
  injectableKey,
  instantiationParameter,
) =>
  (...args: any[]) => {
    const injected = getLegacyGlobalDiForExtensionApi().inject(
      injectableKey,
      instantiationParameter,
    ) as unknown as (...args: any[]) => any;

    return injected(...args);
  }) as Inject<false>;
