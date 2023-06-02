/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { prometheusProviderInjectionToken } from "@k8slens/prometheus";

const prometheusProvidersInjectable = getInjectable({
  id: "prometheus-providers",
  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    return computedInjectMany(prometheusProviderInjectionToken);
  },
});

export default prometheusProvidersInjectable;
