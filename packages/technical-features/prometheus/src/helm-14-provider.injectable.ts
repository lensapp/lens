/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getLensLikeQueryFor } from "./lens-provider.injectable";
import { createPrometheusProvider, findFirstNamespacedService, prometheusProviderInjectionToken } from "./provider";
import { getInjectable } from "@ogre-tools/injectable";

const helm14PrometheusProviderInjectable = getInjectable({
  id: "helm14-prometheus-provider",
  instantiate: () =>
    createPrometheusProvider({
      kind: "helm14",
      name: "Helm 14.x",
      isConfigurable: true,
      getQuery: getLensLikeQueryFor({ rateAccuracy: "5m" }),
      getService: (client) => findFirstNamespacedService(client, "app=prometheus,component=server,heritage=Helm"),
    }),
  injectionToken: prometheusProviderInjectionToken,
});

export default helm14PrometheusProviderInjectable;
