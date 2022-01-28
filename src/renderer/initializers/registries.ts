/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as registries from "../../extensions/registries";

export function initRegistries() {
  registries.CatalogEntityDetailRegistry.createInstance();
  registries.ClusterPageMenuRegistry.createInstance();
  registries.ClusterPageRegistry.createInstance();
  registries.EntitySettingRegistry.createInstance();
  registries.GlobalPageRegistry.createInstance();
  registries.KubeObjectDetailRegistry.createInstance();
  registries.KubeObjectMenuRegistry.createInstance();
  registries.KubeObjectStatusRegistry.createInstance();
  registries.WorkloadsOverviewDetailRegistry.createInstance();
}
