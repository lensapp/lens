import { KubeObject } from "../kube-object";
import { autobind } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
import { KubeApi } from "../kube-api";

export class IngressApi extends KubeApi<Ingress> {
  getMetrics(ingress: string, namespace: string): Promise<IIngressMetrics> {
    const opts = { category: "ingress", ingress }
    return metricsApi.getMetrics({
      bytesSentSuccess: opts,
      bytesSentFailure: opts,
      requestDurationSeconds: opts,
      responseDurationSeconds: opts
    }, {
      namespace,
    });
  }
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
@autobind()
export class Ingress extends KubeObject {
  static kind = "Ingress"
  static namespaced = true
  static apiBase = "/apis/extensions/v1beta1/ingresses"

  spec: {
    tls: {
      secretName: string;
    }[];
    rules?: {
      host?: string;
      http: {
        paths: {
          path?: string;
          backend: {
            serviceName: string;
            servicePort: number;
          };
        }[];
      };
    }[];
    backend?: {
      serviceName: string;
      servicePort: number;
    };
  }
  status: {
    loadBalancer: {
      ingress: ILoadBalancerIngress[];
    };
  }

  getRoutes() {
    const { spec: { tls, rules } } = this
    if (!rules) return []

    let protocol = "http"
    const routes: string[] = []
    if (tls && tls.length > 0) {
      protocol += "s"
    }
    rules.map(rule => {
      const host = rule.host ? rule.host : "*"
      if (rule.http && rule.http.paths) {
        rule.http.paths.forEach(path => {
          routes.push(protocol + "://" + host + (path.path || "/") + " ⇢ " + path.backend.serviceName + ":" + path.backend.servicePort)
        })
      }
    })

    return routes;
  }

  getHosts() {
    const { spec: { rules } } = this
    if (!rules) return []
    return rules.filter(rule => rule.host).map(rule => rule.host)
  }

  getPorts() {
    const ports: number[] = []
    const { spec: { tls, rules, backend } } = this
    const httpPort = 80
    const tlsPort = 443
    if (rules && rules.length > 0) {
      if (rules.some(rule => rule.hasOwnProperty("http"))) {
        ports.push(httpPort)
      }
    }
    else {
      if (backend && backend.servicePort) {
        ports.push(backend.servicePort)
      }
    }
    if (tls && tls.length > 0) {
      ports.push(tlsPort)
    }
    return ports.join(", ")
  }

  getLoadBalancers() {
    const { status: { loadBalancer = { ingress: [] } } } = this;
    
    return (loadBalancer.ingress ?? []).map(address => (
      address.hostname || address.ip
    ))
  }
}

export const ingressApi = new IngressApi({
  objectConstructor: Ingress,
});
