import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export interface IServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
  nodePort?: number;
}

export class ServicePort implements IServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number;
  nodePort?: number;

  constructor(data: IServicePort) {
    this.name = data.name;
    this.protocol = data.protocol;
    this.port = data.port;
    this.targetPort = data.targetPort;
    this.nodePort = data.nodePort;
  }

  toString() {
    if (this.nodePort) {
      return `${this.port}:${this.nodePort}/${this.protocol}`;
    } else {
      return `${this.port}${this.port === this.targetPort ? "" : `:${this.targetPort}`}/${this.protocol}`;
    }
  }
}

interface ServiceSpec {
  type: string;
  clusterIP: string;
  externalTrafficPolicy?: string;
  loadBalancerIP?: string;
  sessionAffinity: string;
  selector: {
    [key: string]: string;
  };
  ports: ServicePort[];
  externalIPs?: string[]; // https://kubernetes.io/docs/concepts/services-networking/service/#external-ips
}

interface ServiceStatus {
  loadBalancer?: {
    ingress?: {
      ip?: string;
      hostname?: string;
    }[];
  };
}

@autobind()
export class Service extends KubeObject<ServiceSpec, ServiceStatus> {
  static kind = "Service";
  static namespaced = true;
  static apiBase = "/api/v1/services";

  getClusterIp() {
    return this.spec?.clusterIP;
  }

  getExternalIps() {
    return this.getLoadBalancer()
      ?.ingress
      ?.map(val => val.ip || val.hostname)
      ?? this.spec?.externalIPs
      ?? [];
  }

  getType() {
    return this.spec?.type || "-";
  }

  getSelector(): string[] {
    return Object.entries(this.spec?.selector ?? {}).map(val => val.join("="));
  }

  getPorts(): ServicePort[] {
    return this.spec?.ports.map(p => new ServicePort(p)) ?? [];
  }

  getLoadBalancer() {
    return this.status?.loadBalancer ?? {};
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
