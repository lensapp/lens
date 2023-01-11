/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { GeneralEntity } from "../index";

export const generalCatalogEntityInjectionToken = getInjectionToken<GeneralEntity>({
  id: "general-catalog-entity-injection-token",
});
