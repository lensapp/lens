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
import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { autoBind } from "../../utils";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { IPodContainer, IPodMetrics } from "./pods.api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export class DaemonSet extends WorkloadKubeObject {
  static kind = "DaemonSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/daemonsets";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  declare spec: {
    selector: {
      matchLabels: {
        [name: string]: string;
      };
    };
    template: {
      metadata: {
        creationTimestamp?: string;
        labels: {
          name: string;
        };
      };
      spec: {
        containers: IPodContainer[];
        initContainers?: IPodContainer[];
        restartPolicy: string;
        terminationGracePeriodSeconds: number;
        dnsPolicy: string;
        hostPID: boolean;
        affinity?: IAffinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        securityContext: {};
        schedulerName: string;
        tolerations: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
      };
    };
    updateStrategy: {
      type: string;
      rollingUpdate: {
        maxUnavailable: number;
      };
    };
    revisionHistoryLimit: number;
  };
  declare status: {
    currentNumberScheduled: number;
    numberMisscheduled: number;
    desiredNumberScheduled: number;
    numberReady: number;
    observedGeneration: number;
    updatedNumberScheduled: number;
    numberAvailable: number;
    numberUnavailable: number;
  };

  getImages() {
    const containers: IPodContainer[] = get(this, "spec.template.spec.containers", []);
    const initContainers: IPodContainer[] = get(this, "spec.template.spec.initContainers", []);

    return [...containers, ...initContainers].map(container => container.image);
  }
}

export class DaemonSetApi extends KubeApi<DaemonSet> {
}

export function getMetricsForDaemonSets(daemonsets: DaemonSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = daemonsets.map(daemonset => `${daemonset.getName()}-[[:alnum:]]{5}`).join("|");
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

/**
 * Only available within kubernetes cluster pages
 */
let daemonSetApi: DaemonSetApi;

if (isClusterPageContext()) {
  daemonSetApi = new DaemonSetApi({
    objectConstructor: DaemonSet,
  });
}

export {
  daemonSetApi,
};
