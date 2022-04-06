/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LensExtensionConstructor } from "../../lens-extension";
import type { InstalledExtension } from "../../extension-discovery/extension-discovery";
import type {
  LensExtensionDependencies } from "../../lens-extension-set-dependencies";
import {
  setLensExtensionDependencies,
} from "../../lens-extension-set-dependencies";

export const createExtensionInstance =
  (dependencies: LensExtensionDependencies) =>
    (ExtensionClass: LensExtensionConstructor, extension: InstalledExtension) => {
      const instance = new ExtensionClass(extension);

      instance[setLensExtensionDependencies](dependencies);

      return instance;
    };
