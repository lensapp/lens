/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { allowedResourcesInjectionToken } from "../../common/cluster-store/allowed-resources-injection-token";

// TODO: Figure out implementation for this later.
const allowedResourcesInjectable = getInjectable({
  id: "allowed-resources",
  instantiate: () => computed(() => new Set<string>()),
  injectionToken: allowedResourcesInjectionToken,
});

export default allowedResourcesInjectable;
