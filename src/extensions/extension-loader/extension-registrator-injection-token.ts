/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectionToken } from "@ogre-tools/injectable";
import type { LensExtension } from "../lens-extension";

export const extensionRegistratorInjectionToken = getInjectionToken<
  (extension: LensExtension) => Injectable<any, any, any>[]
    >({
      id: "extension-registrator-token",
    });
