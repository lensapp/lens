/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { asLegacyGlobalForExtensionApi } from "./as-legacy-global-object-for-extension-api";
import type { Injectable } from "@ogre-tools/injectable";

/**
 * @deprecated use asLegacyGlobalForExtensionApi instead, and use proper implementations instead of "modifications".
 */
export const asLegacyGlobalObjectForExtensionApiWithModifications = <
  InjectableInstance extends InjectionTokenInstance & object,
  InjectionTokenInstance,
  ModificationObject extends object,
>(
    injectable: Injectable<InjectableInstance, InjectionTokenInstance, void>,
    modificationObject: ModificationObject,
  ) =>
    Object.assign(
      asLegacyGlobalForExtensionApi(injectable),
      modificationObject,
    );
