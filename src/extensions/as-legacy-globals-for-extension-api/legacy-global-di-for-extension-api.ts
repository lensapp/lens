/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import assert from "assert";

const legacyGlobalDis = new Map<Environments, DiContainer>();

export enum Environments {
  renderer,
  main,
}

export const setLegacyGlobalDiForExtensionApi = (
  di: DiContainer,
  environment: Environments,
) => {
  legacyGlobalDis.set(environment, di);
};

export const getLegacyGlobalDiForExtensionApi = () => {
  const globalDis = [...legacyGlobalDis.values()];

  if (globalDis.length > 1) {
    throw new Error("Tried to get DI container using legacy globals where there is multiple containers available.");
  }

  return globalDis[0];
};

export function getEnvironmentSpecificLegacyGlobalDiForExtensionApi(environment: Environments) {
  const di = legacyGlobalDis.get(environment);

  assert(di, `missing di for environment=${Environments[environment]}`);

  return di;
}
