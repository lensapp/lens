/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { PrometheusProviderRegistry } from "./provider-registry";

const prometheusProviderRegistryInjectable = getInjectable({
  id: "prometheus-provider-registry",
  instantiate: () => new PrometheusProviderRegistry(),
});

export default prometheusProviderRegistryInjectable;
