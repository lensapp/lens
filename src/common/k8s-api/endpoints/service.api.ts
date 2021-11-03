/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { autoBind } from "../../../renderer/utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
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

let serviceApi: KubeApi<Service>;

if (isClusterPageContext()) {
  serviceApi = new KubeApi<Service>({
    objectConstructor: Service,
  });
}

export {
  serviceApi,
};
