/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";

let legacyGlobalDi: DiContainer;

export const setLegacyGlobalDiForExtensionApi = (di: DiContainer) => {
  legacyGlobalDi = di;
};

export const getLegacyGlobalDiForExtensionApi = () => legacyGlobalDi;
