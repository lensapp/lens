/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import { PrometheusLens } from "../../../prometheus/lens";
import { PrometheusHelm } from "../../../prometheus/helm";
import { PrometheusOperator } from "../../../prometheus/operator";
import { PrometheusStacklight } from "../../../prometheus/stacklight";
import prometheusProviderRegistryInjectable from "../../../prometheus/prometheus-provider-registry.injectable";

const setupPrometheusRegistryInjectable = getInjectable({
  id: "setup-prometheus-registry",

  instantiate: (di) => {
    const prometheusProviderRegistry = di.inject(prometheusProviderRegistryInjectable);

    return {
      run: () => {
        prometheusProviderRegistry
          .registerProvider(new PrometheusLens())
          .registerProvider(new PrometheusHelm())
          .registerProvider(new PrometheusOperator())
          .registerProvider(new PrometheusStacklight());
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupPrometheusRegistryInjectable;
