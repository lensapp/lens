import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export interface IServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
}

export class ServicePort implements IServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
  nodePort?: number;

  constructor(data: IServicePort) {
    Object.assign(this, data)
  }

  toString() {
    if (this.nodePort) {
      return `${this.port}:${this.nodePort}/${this.protocol}`;
    } else {
      return `${this.port}${this.port === this.targetPort ? "" : ":" + this.targetPort}/${this.protocol}`;
    }
  }
}

@autobind()
export class Service extends KubeObject {
  static kind = "Service"
  static namespaced = true
  static apiBase = "/api/v1/services"

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
    loadBalancer?: {
      ingress?: {
        ip?: string;
        hostname?: string;
      }[];
    };
  }

  getClusterIp() {
    return this.spec.clusterIP;
  }

  getExternalIps() {
    const lb = this.getLoadBalancer();
    if (lb && lb.ingress) {
      return lb.ingress.map(val => val.ip || val.hostname)
    }
    return this.spec.externalIPs || [];
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
}

export const serviceApi = new KubeApi({
  objectConstructor: Service,
});
