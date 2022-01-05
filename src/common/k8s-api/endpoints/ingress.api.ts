/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { autoBind, iter } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import type { RequireExactlyOne } from "type-fest";

export class IngressApi extends KubeApi<Ingress> {
}

export function getMetricsForIngress(ingress: string, namespace: string): Promise<IIngressMetrics> {
  const opts = { category: "ingress", ingress, namespace };

  return metricsApi.getMetrics({
    bytesSentSuccess: opts,
    bytesSentFailure: opts,
    requestDurationSeconds: opts,
    responseDurationSeconds: opts,
  }, {
    namespace,
  });
}

export interface IIngressMetrics<T = IMetrics> {
  [metric: string]: T;
  bytesSentSuccess: T;
  bytesSentFailure: T;
  requestDurationSeconds: T;
  responseDurationSeconds: T;
}

export interface ILoadBalancerIngress {
  hostname?: string;
  ip?: string;
}

// extensions/v1beta1
interface IExtensionsBackend {
  serviceName: string;
  servicePort: number | string;
}

// networking.k8s.io/v1
interface INetworkingBackend {
  service: IIngressService;
}

export type IIngressBackend = IExtensionsBackend | INetworkingBackend;

export interface IIngressService {
  name: string;
  port: {
    name?: string;
    number?: number;
  };
}

/**
 * Format an ingress backend into the name of the service and port
 * @param backend The ingress target
 */
export function getBackendServiceNamePort(backend: IIngressBackend): string {
  // .service is available with networking.k8s.io/v1, otherwise using extensions/v1beta1 interface

  if ("service" in backend) {
    const { name, port } = backend.service;

    return `${name}:${port.number ?? port.name}`;
  }

  return `${backend.serviceName}:${backend.servicePort}`;
}

export interface Ingress {
  spec: {
    tls?: {
      secretName: string;
    }[];
    rules?: {
      host?: string;
      http?: {
        paths: {
          path?: string;
          backend: IIngressBackend;
        }[];
      };
    }[];
    // extensions/v1beta1
    backend?: IExtensionsBackend;
    /**
     * The default backend which is exactly on of:
     * - service
     * - resource
     */
    defaultBackend?: RequireExactlyOne<INetworkingBackend & {
      resource: {
        apiGroup: string;
        kind: string;
        name: string;
      };
    }>;
  };
  status: {
    loadBalancer: {
      ingress: ILoadBalancerIngress[];
    };
  };
}

export interface ComputedIngressRoute {
  url: string;
  service: string;
}

export class Ingress extends KubeObject {
  static kind = "Ingress";
  static namespaced = true;
  static apiBase = "/apis/networking.k8s.io/v1/ingresses";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getRoutes(): string[] {
    return this.getRouteDecls().map(({ url, service }) => `${url} ⇢ ${service}`);
  }

  getRouteDecls(): ComputedIngressRoute[] {
    const { spec: { tls = [], rules = [] }} = this;
    const protocol = tls.length === 0
      ? "http"
      : "https";

    return rules.flatMap(({ host = "*", http: { paths } = { paths: [] }}) => (
      paths.map(({ path = "/", backend }) => ({
        url: `${protocol}://${host}${path}`,
        service: getBackendServiceNamePort(backend),
      }))
    ));
  }

  getServiceNamePort(): IExtensionsBackend {
    const { spec: { backend, defaultBackend } = {}} = this;

    const serviceName = defaultBackend?.service?.name ?? backend?.serviceName;
    const servicePort = defaultBackend?.service?.port.number ?? defaultBackend?.service?.port.name ?? backend?.servicePort;

    return {
      serviceName,
      servicePort,
    };
  }

  getHosts() {
    const { spec: { rules = [] }} = this;

    return [...iter.filterMap(rules, rule => rule.host)];
  }

  getPorts() {
    const ports: number[] = [];
    const { spec: { tls, rules, backend, defaultBackend }} = this;
    const httpPort = 80;
    const tlsPort = 443;
    // Note: not using the port name (string)
    const servicePort = defaultBackend?.service.port.number ?? backend?.servicePort;

    if (rules && rules.length > 0) {
      if (rules.some(rule => Object.prototype.hasOwnProperty.call(rule, "http"))) {
        ports.push(httpPort);
      }
    } else if (servicePort !== undefined) {
      ports.push(Number(servicePort));
    }

    if (tls && tls.length > 0) {
      ports.push(tlsPort);
    }

    return ports.join(", ");
  }

  getLoadBalancers() {
    const { status: { loadBalancer = { ingress: [] }}} = this;

    return (loadBalancer.ingress ?? []).map(address => (
      address.hostname || address.ip
    ));
  }
}

let ingressApi: IngressApi;

if (isClusterPageContext()) {
  ingressApi = new IngressApi({
    objectConstructor: Ingress,
    // Add fallback for Kubernetes <1.19
    checkPreferredVersion: true,
    fallbackApiBases: ["/apis/extensions/v1beta1/ingresses"],
  });
}

export {
  ingressApi,
};
