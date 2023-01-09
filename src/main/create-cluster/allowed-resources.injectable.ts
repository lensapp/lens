/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { shouldShowResourceInjectionToken } from "../../common/cluster-store/allowed-resources-injection-token";

const allowedResourcesInjectable = getInjectable({
  id: "allowed-resources",
  instantiate: () => computed(() => false),
  injectionToken: shouldShowResourceInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default allowedResourcesInjectable;
