/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface ServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
  nodePort?: number;
}

export class ServicePort {
  constructor(data: ServicePort) {
    Object.assign(this, data);
  }

  toString() {
    if (this.nodePort) {
      return `${this.port}:${this.nodePort}/${this.protocol}`;
    } else {
      return `${this.port}${this.port === this.targetPort ? "" : `:${this.targetPort}`}/${this.protocol}`;
    }
  }
}

export interface ServiceSpec {
  type: string;
  clusterIP: string;
  clusterIPs?: string[];
  externalTrafficPolicy?: string;
  externalName?: string;
  loadBalancerIP?: string;
  loadBalancerSourceRanges?: string[];
  sessionAffinity: string;
  selector: Partial<Record<string, string>>;
  ports: ServicePort[];
  healthCheckNodePort?: number;
  externalIPs?: string[]; // https://kubernetes.io/docs/concepts/services-networking/service/#external-ips
  topologyKeys?: string[];
  ipFamilies?: string[];
  ipFamilyPolicy?: string;
  allocateLoadBalancerNodePorts?: boolean;
  loadBalancerClass?: string;
  internalTrafficPolicy?: string;
}

export interface ServiceStatus {
  loadBalancer?: {
    ingress?: {
      ip?: string;
      hostname?: string;
    }[];
  };
}

export class Service extends KubeObject<ServiceStatus, ServiceSpec, "namespace-scoped"> {
  static readonly kind = "Service";
  static readonly namespaced = true;
  static readonly apiBase = "/api/v1/services";

  getClusterIp() {
    return this.spec.clusterIP;
  }

  getClusterIps() {
    return this.spec.clusterIPs || [];
  }

  getExternalIps() {
    const lb = this.getLoadBalancer();

    if (lb?.ingress) {
      return lb.ingress.map(val => val.ip || val.hostname);
    }

    if (Array.isArray(this.spec?.externalIPs)) {
      return this.spec.externalIPs;
    }

    return [];
  }

  getType() {
    return this.spec.type || "-";
  }

  getSelector(): string[] {
    if (!this.spec.selector) return [];

    return Object.entries(this.spec.selector).map(val => val.join("="));
  }

  getPorts(): ServicePort[] {
    const ports = this.spec.ports || [];

    return ports.map(p => new ServicePort(p));
  }

  getLoadBalancer() {
    return this.status?.loadBalancer;
  }

  isActive() {
    return this.getType() !== "LoadBalancer" || this.getExternalIps().length > 0;
  }

  getStatus() {
    return this.isActive() ? "Active" : "Pending";
  }

  getIpFamilies() {
    return this.spec.ipFamilies || [];
  }

  getIpFamilyPolicy() {
    return this.spec.ipFamilyPolicy || "";
  }
}

export class ServiceApi extends KubeApi<Service> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: Service,
    });
  }
}

export const serviceApi = isClusterPageContext()
  ? new ServiceApi()
  : undefined as never;
