/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as registries from "../../extensions/registries";

export function initRegistries() {
  registries.CatalogEntityDetailRegistry.createInstance();
  registries.KubeObjectDetailRegistry.createInstance();
  registries.EntitySettingRegistry.createInstance();
}
