import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export interface ServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
}

export class ServicePort implements ServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
  nodePort?: number;

  constructor(data: ServicePort) {
    Object.assign(this, data);
  }

  toString(): string {
    if (this.nodePort) {
      return `${this.port}:${this.nodePort}/${this.protocol}`;
    } else {
      return `${this.port}${this.port === this.targetPort ? "" : ":" + this.targetPort}/${this.protocol}`;
    }
  }
}

export interface LoadBalancer {
  ingress?: {
    ip?: string;
    hostname?: string;
  }[];
}

@autobind()
export class Service extends KubeObject {
  static kind = "Service"

  spec: {
    type: string;
    clusterIP: string;
    externalTrafficPolicy?: string;
    loadBalancerIP?: string;
    sessionAffinity: string;
    selector: { [key: string]: string };
    ports: ServicePort[];
    externalIPs?: string[]; // https://kubernetes.io/docs/concepts/services-networking/service/#external-ips
  }

  status: {
    loadBalancer?: LoadBalancer;
  }

  getExternalIps(): string[] {
    return this.status.loadBalancer?.ingress?.map((val): string => val.ip || val.hostname || "") 
    || this.spec.externalIPs 
    || [];
  }

  getType(): string {
    return this.spec.type || "-";
  }

  getSelector(): string[] {
    if (!this.spec.selector) {
      return [];
    }
    return Object.entries(this.spec.selector).map(val => val.join("="));
  }

  getPorts(): ServicePort[] {
    const ports = this.spec.ports || [];
    return ports.map(p => new ServicePort(p));
  }

  isActive(): boolean {
    return this.getType() !== "LoadBalancer" || this.getExternalIps().length > 0;
  }

  getStatus(): "Active" | "Pending" {
    return this.isActive() ? "Active" : "Pending";
  }
}

export const serviceApi = new KubeApi({
  kind: Service.kind,
  apiBase: "/api/v1/services",
  isNamespaced: true,
  objectConstructor: Service,
});
