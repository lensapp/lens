/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { autoBind } from "../../utils";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { IPodMetrics } from "./pod.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { LabelSelector } from "../kube-object";

export function getMetricsForStatefulSets(statefulSets: StatefulSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = statefulSets.map(statefulset => `${statefulset.getName()}-[[:digit:]]+`).join("|");
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
    selector: LabelSelector;
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


interface ReplicasStatus {
  status?: {
    replicas: number;
  }
}

export class StatefulSetApi extends KubeApi<StatefulSet> {
  constructor(args: SpecificApiOptions<StatefulSet> = {}) {
    super({
      ...args,
      objectConstructor: StatefulSet,
    });
  }

  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.getUrl(params)}/scale`;
  }

  async getReplicas(params: { namespace: string; name: string }): Promise<number> {
    const { status } = await this.request .get<ReplicasStatus>(this.getScaleApiUrl(params));

    return status?.replicas ?? 0;
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
