/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { matches } from "lodash/fp";
import type { PrometheusProvider } from "./provider";
import prometheusProvidersInjectable from "./providers.injectable";

export type GetPrometheusProviderByKind = (kind: string) => PrometheusProvider | undefined;

const getPrometheusProviderByKindInjectable = getInjectable({
  id: "get-prometheus-provider-by-kind",
  instantiate: (di): GetPrometheusProviderByKind => {
    const providers = di.inject(prometheusProvidersInjectable);

    return (kind) => providers.get().find(matches({ kind }));
  },
});

export default getPrometheusProviderByKindInjectable;
