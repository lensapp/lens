/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { PrometheusLens } from "../../prometheus/lens";
import { PrometheusHelm } from "../../prometheus/helm";
import { PrometheusHelm14 } from "../../prometheus/helm-14";
import { PrometheusOperator } from "../../prometheus/operator";
import { PrometheusStacklight } from "../../prometheus/stacklight";
import prometheusProviderRegistryInjectable from "../../prometheus/prometheus-provider-registry.injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";

const setupPrometheusRegistryInjectable = getInjectable({
  id: "setup-prometheus-registry",

  instantiate: (di) => {
    const prometheusProviderRegistry = di.inject(prometheusProviderRegistryInjectable);

    return {
      run: () => {
        prometheusProviderRegistry
          .registerProvider(new PrometheusLens())
          .registerProvider(new PrometheusHelm14())
          .registerProvider(new PrometheusHelm())
          .registerProvider(new PrometheusOperator())
          .registerProvider(new PrometheusStacklight());
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupPrometheusRegistryInjectable;
