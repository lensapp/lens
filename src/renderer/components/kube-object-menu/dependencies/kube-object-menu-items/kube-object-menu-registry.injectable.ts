/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { KubeObjectMenuRegistry } from "../../../../../extensions/registries";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

const kubeObjectMenuRegistryInjectable = getInjectable({
  instantiate: () => KubeObjectMenuRegistry.getInstance(),
  lifecycle: lifecycleEnum.singleton,
});

export default kubeObjectMenuRegistryInjectable;
