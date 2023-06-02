/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CoreV1Api } from "@kubernetes/client-node";
import { getInjectionToken } from "@ogre-tools/injectable";
import { isRequestError } from "@k8slens/utilities";

export interface PrometheusService extends PrometheusServiceInfo {
  kind: string;
}

export interface PrometheusServiceInfo {
  namespace: string;
  service: string;
  port: number;
}

export interface PrometheusProvider {
  readonly kind: string;
  readonly name: string;
  readonly isConfigurable: boolean;

  getQuery(opts: Record<string, string>, queryName: string): string;
  getPrometheusService(client: CoreV1Api): Promise<PrometheusService>;
}

export interface CreatePrometheusProviderOpts {
  readonly kind: string;
  readonly name: string;
  readonly isConfigurable: boolean;

  getQuery(opts: Record<string, string>, queryName: string): string;
  getService(client: CoreV1Api): Promise<PrometheusServiceInfo>;
}

export const createPrometheusProvider = ({
  getService,
  ...opts
}: CreatePrometheusProviderOpts): PrometheusProvider => ({
  ...opts,
  getPrometheusService: async (client) => {
    try {
      return {
        kind: opts.kind,
        ...(await getService(client)),
      };
    } catch (error) {
      throw new Error(`Failed to find Prometheus provider for "${opts.name}"`, { cause: error });
    }
  },
});

export async function findFirstNamespacedService(
  client: CoreV1Api,
  ...selectors: string[]
): Promise<PrometheusServiceInfo> {
  try {
    for (const selector of selectors) {
      const {
        body: {
          items: [service],
        },
      } = await client.listServiceForAllNamespaces(undefined, undefined, undefined, selector);

      if (service?.metadata?.namespace && service.metadata.name && service.spec?.ports) {
        return {
          namespace: service.metadata.namespace,
          service: service.metadata.name,
          port: service.spec.ports[0].port,
        };
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to list services in all namespaces: ${isRequestError(error) ? error.response?.body.message : error}`,
    );
  }

  throw new Error(`No service found from any namespace`);
}

export async function findNamespacedService(
  client: CoreV1Api,
  name: string,
  namespace: string,
): Promise<PrometheusServiceInfo> {
  try {
    const { body: service } = await client.readNamespacedService(name, namespace);

    if (!service.metadata?.namespace || !service.metadata.name || !service.spec?.ports) {
      throw new Error(`Service found in namespace="${namespace}" did not have required information`);
    }

    return {
      namespace: service.metadata.namespace,
      service: service.metadata.name,
      port: service.spec.ports[0].port,
    };
  } catch (error) {
    throw new Error(
      `Failed to list services in namespace="${namespace}": ${
        isRequestError(error) ? error.response?.body.message : error
      }`,
    );
  }
}

export interface BytesSentArgs {
  rateAccuracy: string;
  ingress: string;
  namespace: string;
  statuses: string;
}

export function bytesSent({ rateAccuracy, ingress, namespace, statuses }: BytesSentArgs): string {
  return `sum(rate(nginx_ingress_controller_bytes_sent_sum{ingress="${ingress}",namespace="${namespace}",status=~"${statuses}"}[${rateAccuracy}])) by (ingress, namespace)`;
}

export const prometheusProviderInjectionToken = getInjectionToken<PrometheusProvider>({
  id: "prometheus-provider",
});
