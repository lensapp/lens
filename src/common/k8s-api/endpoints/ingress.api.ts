/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { TypedLocalObjectReference } from "../kube-object";
import { KubeObject } from "../kube-object";
import { autoBind, hasTypedProperty, isString, iter } from "../../utils";
import type { IMetrics } from "./metrics.api";
import { metricsApi } from "./metrics.api";
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
export interface ExtensionsBackend {
  serviceName?: string;
  servicePort?: number | string;
}

// networking.k8s.io/v1
export interface NetworkingBackend {
  service?: IngressService;
}

export type IngressBackend = (ExtensionsBackend | NetworkingBackend) & {
  resource?: TypedLocalObjectReference;
};

export interface IngressService {
  name: string;
  port: RequireExactlyOne<{
    name: string;
    number: number;
  }>;
}

function isExtensionsBackend(backend: IngressBackend): backend is ExtensionsBackend {
  return hasTypedProperty(backend, "serviceName", isString);
}

/**
 * Format an ingress backend into the name of the service and port
 * @param backend The ingress target
 */
export function getBackendServiceNamePort(backend: IngressBackend): string {
  if (isExtensionsBackend(backend)) {
    return `${backend.serviceName}:${backend.servicePort}`;
  }

  if (backend.service) {
    const { name, port } = backend.service;

    return `${name}:${port.number ?? port.name}`;
  }

  return "<unknown>";
}

export interface IngressRule {
  host?: string;
  http?: {
    paths: {
      path?: string;
      backend: IngressBackend;
    }[];
  };
}

export interface Ingress {
  spec?: {
    tls?: {
      secretName: string;
    }[];
    rules?: IngressRule[];
    // extensions/v1beta1
    backend?: ExtensionsBackend;
    /**
     * The default backend which is exactly on of:
     * - service
     * - resource
     */
    defaultBackend?: RequireExactlyOne<NetworkingBackend & {
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
  displayAsLink: boolean;
  pathname: string;
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

  getRules() {
    return this.spec.rules ?? [];
  }

  getRoutes(): string[] {
    return computeRouteDeclarations(this).map(({ url, service }) => `${url} ⇢ ${service}`);
  }

  getServiceNamePort(): ExtensionsBackend {
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
    const servicePort = defaultBackend?.service?.port.number ?? backend?.servicePort;

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

export function computeRuleDeclarations(ingress: Ingress, rule: IngressRule): ComputedIngressRoute[] {
  const { host = "*", http: { paths } = { paths: [] }} = rule;
  const protocol = (ingress.spec?.tls?.length ?? 0) === 0
    ? "http"
    : "https";

  return paths.map(({ path = "/", backend }) => ({
    displayAsLink: !host.includes("*"),
    pathname: path,
    url: `${protocol}://${host}${path}`,
    service: getBackendServiceNamePort(backend),
  }));
}

export function computeRouteDeclarations(ingress: Ingress): ComputedIngressRoute[] {
  return ingress.getRules().flatMap(rule => computeRuleDeclarations(ingress, rule));
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
