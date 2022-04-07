/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectScope, TypedLocalObjectReference } from "../kube-object";
import { KubeObject } from "../kube-object";
import { hasTypedProperty, isString, iter } from "../../utils";
import type { MetricData } from "./metrics.api";
import { metricsApi } from "./metrics.api";
import type { DerivedKubeApiOptions, IgnoredKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import type { RequireExactlyOne } from "type-fest";

export class IngressApi extends KubeApi<Ingress> {
  constructor(opts: DerivedKubeApiOptions & IgnoredKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: Ingress,
      // Add fallback for Kubernetes <1.19
      checkPreferredVersion: true,
      fallbackApiBases: ["/apis/extensions/v1beta1/ingresses"],
    });
  }
}

export function getMetricsForIngress(ingress: string, namespace: string): Promise<IngressMetricData> {
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

export interface IngressMetricData extends Partial<Record<string, MetricData>> {
  bytesSentSuccess: MetricData;
  bytesSentFailure: MetricData;
  requestDurationSeconds: MetricData;
  responseDurationSeconds: MetricData;
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
export function getBackendServiceNamePort(backend: IngressBackend | undefined): string {
  if (!backend) {
    return "<unknown>";
  }

  if (isExtensionsBackend(backend)) {
    return `${backend.serviceName}:${backend.servicePort}`;
  }

  if (backend.service) {
    const { name, port } = backend.service;

    return `${name}:${port.number ?? port.name}`;
  }

  return "<unknown>";
}

export interface HTTPIngressPath {
  pathType: "Exact" | "Prefix" | "ImplementationSpecific";
  path?: string;
  backend?: IngressBackend;
}

export interface HTTPIngressRuleValue {
  paths: HTTPIngressPath[];
}

export interface IngressRule {
  host?: string;
  http?: HTTPIngressRuleValue;
}

export interface IngressSpec {
  tls: {
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
}

export interface IngressStatus {
  loadBalancer: {
    ingress: ILoadBalancerIngress[];
  };
}

export class Ingress extends KubeObject<IngressStatus, IngressSpec, KubeObjectScope.Namespace> {
  static readonly kind = "Ingress";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/networking.k8s.io/v1/ingresses";

  getRules() {
    return this.spec.rules ?? [];
  }

  getRoutes(): string[] {
    return computeRouteDeclarations(this).map(({ url, service }) => `${url} ⇢ ${service}`);
  }

  getServiceNamePort(): ExtensionsBackend | undefined {
    const { spec: { backend, defaultBackend } = {}} = this;

    const serviceName = defaultBackend?.service?.name ?? backend?.serviceName;
    const servicePort = defaultBackend?.service?.port.number ?? defaultBackend?.service?.port.name ?? backend?.servicePort;

    if (!serviceName || !servicePort) {
      return undefined;
    }

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
    const { spec: { tls, rules = [], backend, defaultBackend }} = this;
    const httpPort = 80;
    const tlsPort = 443;
    // Note: not using the port name (string)
    const servicePort = defaultBackend?.service?.port.number ?? backend?.servicePort;

    if (rules.length > 0) {
      if (rules.some(rule => rule.http)) {
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
    return this.status?.loadBalancer.ingress.map(address => (
      address.hostname || address.ip
    )) ?? [];
  }
}

export interface ComputedIngressRoute {
  displayAsLink: boolean;
  pathname: string;
  url: string;
  service: string;
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

export const ingressApi = isClusterPageContext()
  ? new IngressApi()
  : undefined as never;
