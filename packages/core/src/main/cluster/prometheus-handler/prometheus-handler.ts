/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PrometheusProvider, PrometheusService } from "@k8slens/prometheus";
import type { ClusterPrometheusPreferences } from "../../../common/cluster-types";
import type { Cluster } from "../../../common/cluster/cluster";
import { CoreV1Api } from "@kubernetes/client-node";
import type { GetPrometheusProviderByKind } from "../../prometheus/get-by-kind.injectable";
import type { IComputedValue } from "mobx";
import type { Logger } from "@k8slens/logger";
import type { LoadProxyKubeconfig } from "../load-proxy-kubeconfig.injectable";

export interface PrometheusDetails {
  prometheusPath: string;
  provider: PrometheusProvider;
}

interface PrometheusServicePreferences {
  namespace: string;
  service: string;
  port: number;
  prefix: string;
}

interface Dependencies {
  readonly prometheusProviders: IComputedValue<PrometheusProvider[]>;
  readonly logger: Logger;
  getPrometheusProviderByKind: GetPrometheusProviderByKind;
  loadProxyKubeconfig: LoadProxyKubeconfig;
}

export interface ClusterPrometheusHandler {
  setupPrometheus(preferences?: ClusterPrometheusPreferences): void;
  getPrometheusDetails(): Promise<PrometheusDetails>;
}

const ensurePrometheusPath = ({ service, namespace, port }: PrometheusService) => `${namespace}/services/${service}:${port}`;

export const createClusterPrometheusHandler = (...args: [Dependencies, Cluster]): ClusterPrometheusHandler => {
  const [deps, cluster] = args;
  const {
    getPrometheusProviderByKind,
    loadProxyKubeconfig,
    logger,
    prometheusProviders,
  } = deps;

  let prometheusProvider: string | undefined = undefined;
  let prometheus: PrometheusServicePreferences | undefined = undefined;

  const setupPrometheus: ClusterPrometheusHandler["setupPrometheus"] = (preferences = {}) => {
    prometheusProvider = preferences.prometheusProvider?.type;
    prometheus = preferences.prometheus;
  };

  const ensurePrometheusProvider = (service: PrometheusService) => {
    if (!prometheusProvider) {
      logger.info(`[CONTEXT-HANDLER]: using ${service.kind} as prometheus provider for clusterId=${cluster.id}`);
      prometheusProvider = service.kind;
    }

    return getPrometheusProviderByKind(prometheusProvider);
  };

  const listPotentialProviders = () => {
    if (prometheusProvider) {
      const provider = getPrometheusProviderByKind(prometheusProvider);

      if (provider) {
        return [provider];
      }
    }

    return prometheusProviders.get();
  };

  const getPrometheusService = async (): Promise<PrometheusService> => {
    setupPrometheus(cluster.preferences);

    if (prometheus && prometheusProvider) {
      return {
        kind: prometheusProvider,
        namespace: prometheus.namespace,
        service: prometheus.service,
        port: prometheus.port,
      };
    }

    const providers = listPotentialProviders();
    const proxyConfig = await loadProxyKubeconfig();
    const apiClient = proxyConfig.makeApiClient(CoreV1Api);
    const potentialServices = await Promise.allSettled(
      providers.map(provider => provider.getPrometheusService(apiClient)),
    );
    const errors = [];

    for (const res of potentialServices) {
      switch (res.status) {
        case "rejected":
          errors.push(res.reason);
          break;

        case "fulfilled":
          if (res.value) {
            return res.value;
          }
      }
    }

    throw new Error("No Prometheus service found", { cause: errors });
  };

  const getPrometheusDetails: ClusterPrometheusHandler["getPrometheusDetails"] = async () => {
    const service = await getPrometheusService();
    const prometheusPath = ensurePrometheusPath(service);
    const provider = ensurePrometheusProvider(service);

    return { prometheusPath, provider };
  };

  setupPrometheus(cluster.preferences);

  return {
    setupPrometheus,
    getPrometheusDetails,
  };
};
