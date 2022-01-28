/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import get from "lodash/get";
import { autoBind } from "../../../renderer/utils";
import { WorkloadKubeObject } from "../workload-kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { IPodContainer, IPodMetrics, Pod } from "./pod.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { LabelSelector } from "../kube-object";

export function getMetricsForReplicaSets(replicasets: ReplicaSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = replicasets.map(replicaset => `${replicaset.getName()}-[[:alnum:]]{5}`).join("|");
  const opts = { category: "pods", pods: podSelector, namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    memoryUsage: opts,
    fsUsage: opts,
    fsWrites: opts,
    fsReads: opts,
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
    selector: LabelSelector;
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

interface ReplicasStatus {
  status?: {
    replicas: number;
  }
}

export class ReplicaSetApi extends KubeApi<ReplicaSet> {
  constructor(args: SpecificApiOptions<ReplicaSet> = {}) {
    super({
      ...args,
      objectConstructor: ReplicaSet,
    });
  }

  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.getUrl(params)}/scale`;
  }

  async getReplicas(params: { namespace: string; name: string }): Promise<number> {
    const { status } = await this.request.get<ReplicasStatus>(this.getScaleApiUrl(params));

    return status?.replicas ?? 0;
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
