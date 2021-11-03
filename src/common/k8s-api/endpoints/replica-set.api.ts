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

import get from "lodash/get";
import { autoBind } from "../../../renderer/utils";
import { WorkloadKubeObject } from "../workload-kube-object";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { IPodContainer, IPodMetrics, Pod } from "./pods.api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export class ReplicaSetApi extends KubeApi<ReplicaSet> {
  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.getUrl(params)}/scale`;
  }

  getReplicas(params: { namespace: string; name: string }): Promise<number> {
    return this.request
      .get(this.getScaleApiUrl(params))
      .then(({ status }: any) => status?.replicas);
  }

  scale(params: { namespace: string; name: string }, replicas: number) {
    return this.request.put(this.getScaleApiUrl(params), {
      data: {
        metadata: params,
        spec: {
          replicas,
        },
      },
    });
  }
}

export function getMetricsForReplicaSets(replicasets: ReplicaSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = replicasets.map(replicaset => `${replicaset.getName()}-[[:alnum:]]{5}`).join("|");
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

export class ReplicaSet extends WorkloadKubeObject {
  static kind = "ReplicaSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/replicasets";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  declare spec: {
    replicas?: number;
    selector: { matchLabels: { [app: string]: string }};
    template?: {
      metadata: {
        labels: {
          app: string;
        };
      };
      spec?: Pod["spec"];
    };
    minReadySeconds?: number;
  };
  declare status: {
    replicas: number;
    fullyLabeledReplicas?: number;
    readyReplicas?: number;
    availableReplicas?: number;
    observedGeneration?: number;
    conditions?: {
      type: string;
      status: string;
      lastUpdateTime: string;
      lastTransitionTime: string;
      reason: string;
      message: string;
    }[];
  };

  getDesired() {
    return this.spec.replicas || 0;
  }

  getCurrent() {
    return this.status.availableReplicas || 0;
  }

  getReady() {
    return this.status.readyReplicas || 0;
  }

  getImages() {
    const containers: IPodContainer[] = get(this, "spec.template.spec.containers", []);

    return [...containers].map(container => container.image);
  }
}

let replicaSetApi: ReplicaSetApi;

if (isClusterPageContext()) {
  replicaSetApi = new ReplicaSetApi({
    objectConstructor: ReplicaSet,
  });
}

export {
  replicaSetApi,
};
