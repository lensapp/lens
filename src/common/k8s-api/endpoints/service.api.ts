/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../../renderer/utils";
import { KubeObject } from "../kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";

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

export interface Service {
  spec: {
    type: string;
    clusterIP: string;
    clusterIPs?: string[];
    externalTrafficPolicy?: string;
    externalName?: string;
    loadBalancerIP?: string;
    loadBalancerSourceRanges?: string[];
    sessionAffinity: string;
    selector: { [key: string]: string };
    ports: ServicePort[];
    healthCheckNodePort?: number;
    externalIPs?: string[]; // https://kubernetes.io/docs/concepts/services-networking/service/#external-ips
    topologyKeys?: string[];
    ipFamilies?: string[];
    ipFamilyPolicy?: string;
    allocateLoadBalancerNodePorts?: boolean;
    loadBalancerClass?: string;
    internalTrafficPolicy?: string;
  };

  status: {
    loadBalancer?: {
      ingress?: {
        ip?: string;
        hostname?: string;
      }[];
    };
  };
}

export class Service extends KubeObject {
  static kind = "Service";
  static namespaced = true;
  static apiBase = "/api/v1/services";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

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
    return this.status.loadBalancer;
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
  constructor(args: SpecificApiOptions<Service> = {}) {
    super({
      ...args,
      objectConstructor: Service,
    });
  }
}
