/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { matches } from "lodash/fp";
import type { PrometheusProvider } from "@k8slens/prometheus";
import prometheusProvidersInjectable from "./providers.injectable";

export type GetPrometheusProviderByKind = (kind: string) => PrometheusProvider;

const getPrometheusProviderByKindInjectable = getInjectable({
  id: "get-prometheus-provider-by-kind",
  instantiate: (di): GetPrometheusProviderByKind => {
    const providers = di.inject(prometheusProvidersInjectable);

    return (kind) => {
      const provider = providers.get().find(matches({ kind }));

      if (!provider) {
        throw new Error(`Provider of kind "${kind}" does not exist`);
      }

      return provider;
    };
  },
});

export default getPrometheusProviderByKindInjectable;
