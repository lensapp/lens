import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

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
    ports: { name?: string; protocol: string; port: number; targetPort: number }[];
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

  getPorts(): string[] {
    const ports = this.spec.ports || [];
    return ports.map(({ port, protocol, targetPort }) => {
      return `${port}${port === targetPort ? "" : ":" + targetPort}/${protocol}`
    })
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
  kind: Service.kind,
  apiBase: "/api/v1/services",
  isNamespaced: true,
  objectConstructor: Service,
});
