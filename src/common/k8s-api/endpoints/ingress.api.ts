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

import { KubeObject } from "../kube-object";
import { autoBind } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
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
interface IExtensionsBackend {
  serviceName: string;
  servicePort: number | string;
}

// networking.k8s.io/v1
interface INetworkingBackend {
  service: IIngressService;
}

export type IIngressBackend = IExtensionsBackend | INetworkingBackend;

export interface IIngressService {
  name: string;
  port: {
    name?: string;
    number?: number;
  }
}

export const getBackendServiceNamePort = (backend: IIngressBackend) => {
  // .service is available with networking.k8s.io/v1, otherwise using extensions/v1beta1 interface
  const serviceName = "service" in backend ? backend.service.name : backend.serviceName;
  // Port is specified either with a number or name
  const servicePort = "service" in backend ? backend.service.port.number ?? backend.service.port.name : backend.servicePort;

  return { serviceName, servicePort };
};

export interface Ingress {
  spec: {
    tls: {
      secretName: string;
    }[];
    rules?: {
      host?: string;
      http: {
        paths: {
          path?: string;
          backend: IIngressBackend;
        }[];
      };
    }[];
    // extensions/v1beta1
    backend?: IExtensionsBackend;
    /**
     * The default backend which is exactly on of:
     * - service
     * - resource
     */
    defaultBackend?: RequireExactlyOne<INetworkingBackend & {
      resource: {
        apiGroup: string;
        kind: string;
        name: string;
      }
    }>
  };
  status: {
    loadBalancer: {
      ingress: ILoadBalancerIngress[];
    };
  };
}

export class Ingress extends KubeObject {
  static kind = "Ingress";
  static namespaced = true;
  static apiBase = "/apis/networking.k8s.io/v1/ingresses";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getRoutes() {
    const { spec: { tls, rules }} = this;

    if (!rules) return [];

    let protocol = "http";
    const routes: string[] = [];

    if (tls && tls.length > 0) {
      protocol += "s";
    }
    rules.map(rule => {
      const host = rule.host ? rule.host : "*";

      if (rule.http && rule.http.paths) {
        rule.http.paths.forEach(path => {
          const { serviceName, servicePort } = getBackendServiceNamePort(path.backend);

          routes.push(`${protocol}://${host}${path.path || "/"} ⇢ ${serviceName}:${servicePort}`);
        });
      }
    });

    return routes;
  }

  getServiceNamePort(): IExtensionsBackend {
    const { spec: { backend, defaultBackend } = {}} = this;

    const serviceName = defaultBackend?.service?.name ?? backend?.serviceName;
    const servicePort = defaultBackend?.service?.port.number ?? defaultBackend?.service?.port.name ?? backend?.servicePort;

    return {
      serviceName,
      servicePort,
    };
  }

  getHosts() {
    const { spec: { rules }} = this;

    if (!rules) return [];

    return rules.filter(rule => rule.host).map(rule => rule.host);
  }

  getPorts() {
    const ports: number[] = [];
    const { spec: { tls, rules, backend, defaultBackend }} = this;
    const httpPort = 80;
    const tlsPort = 443;
    // Note: not using the port name (string)
    const servicePort = defaultBackend?.service.port.number ?? backend?.servicePort;

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
