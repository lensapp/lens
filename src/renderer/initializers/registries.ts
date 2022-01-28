/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as registries from "../../extensions/registries";

export function initRegistries() {
  registries.ClusterPageMenuRegistry.createInstance();
  registries.ClusterPageRegistry.createInstance();
  registries.EntitySettingRegistry.createInstance();
  registries.GlobalPageRegistry.createInstance();
  registries.KubeObjectMenuRegistry.createInstance();
  registries.StatusBarRegistry.createInstance();
  registries.WorkloadsOverviewDetailRegistry.createInstance();
}
