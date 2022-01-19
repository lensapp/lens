/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";

let legacyGlobalDi: DependencyInjectionContainer;

export const setLegacyGlobalDiForExtensionApi = (di: DependencyInjectionContainer) => {
  legacyGlobalDi = di;
};

export const getLegacyGlobalDiForExtensionApi = () => legacyGlobalDi;
