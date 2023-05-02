/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import { createClusterPrometheusHandler } from "./prometheus-handler";
import getPrometheusProviderByKindInjectable from "../../prometheus/get-by-kind.injectable";
import prometheusProvidersInjectable from "../../prometheus/providers.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import loadProxyKubeconfigInjectable from "../load-proxy-kubeconfig.injectable";

const prometheusHandlerInjectable = getInjectable({
  id: "prometheus-handler",

  instantiate: (di, cluster) => createClusterPrometheusHandler(
    {
      getPrometheusProviderByKind: di.inject(getPrometheusProviderByKindInjectable),
      prometheusProviders: di.inject(prometheusProvidersInjectable),
      logger: di.inject(loggerInjectionToken),
      loadProxyKubeconfig: di.inject(loadProxyKubeconfigInjectable, cluster),
    },
    cluster,
  ),
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default prometheusHandlerInjectable;
