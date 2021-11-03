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

import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { autoBind } from "../../utils";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { IPodMetrics } from "./pods.api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export class StatefulSetApi extends KubeApi<StatefulSet> {
  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.getUrl(params)}/scale`;
  }

  getReplicas(params: { namespace: string; name: string }): Promise<number> {
    return this.request
      .get(this.getScaleApiUrl(params))
      .then(({ status }: any) => status?.replicas);
  }

  scale(params: { namespace: string; name: string }, replicas: number) {
    return this.request.patch(this.getScaleApiUrl(params), {
      data: {
        spec: {
          replicas,
        },
      },
    },
    {
      headers: {
        "content-type": "application/merge-patch+json",
      },
    });
  }
}

export function getMetricsForStatefulSets(statefulSets: StatefulSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = statefulSets.map(statefulset => `${statefulset.getName()}-[[:digit:]]+`).join("|");
  const opts = { category: "pods", pods: podSelector, namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    memoryUsage: opts,
    fsUsage: opts,
    networkReceive: opts,
    networkTransmit: opts,
  }, {
    namespace,
  });
}

export class StatefulSet extends WorkloadKubeObject {
  static kind = "StatefulSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/statefulsets";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  declare spec: {
    serviceName: string;
    replicas: number;
    selector: {
      matchLabels: {
        [key: string]: string;
      };
    };
    template: {
      metadata: {
        labels: {
          app: string;
        };
      };
      spec: {
        containers: null | {
          name: string;
          image: string;
          ports: {
            containerPort: number;
            name: string;
          }[];
          volumeMounts: {
            name: string;
            mountPath: string;
          }[];
        }[];
        affinity?: IAffinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        tolerations: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
      };
    };
    volumeClaimTemplates: {
      metadata: {
        name: string;
      };
      spec: {
        accessModes: string[];
        resources: {
          requests: {
            storage: string;
          };
        };
      };
    }[];
  };
  declare status: {
    observedGeneration: number;
    replicas: number;
    currentReplicas: number;
    readyReplicas: number;
    currentRevision: string;
    updateRevision: string;
    collisionCount: number;
  };

  getReplicas() {
    return this.spec.replicas || 0;
  }

  getImages() {
    const containers = this.spec.template?.spec?.containers ?? [];

    return containers.map(container => container.image);
  }
}

let statefulSetApi: StatefulSetApi;

if (isClusterPageContext()) {
  statefulSetApi = new StatefulSetApi({
    objectConstructor: StatefulSet,
  });
}

export {
  statefulSetApi,
};
