/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import get from "lodash/get";
import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { autoBind } from "../../utils";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { IPodContainer, IPodMetrics } from "./pod.api";
import type { LabelSelector } from "../kube-object";

export class DaemonSet extends WorkloadKubeObject {
  static kind = "DaemonSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/daemonsets";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  declare spec: {
    selector: LabelSelector;
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

export function getMetricsForDaemonSets(daemonsets: DaemonSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = daemonsets.map(daemonset => `${daemonset.getName()}-[[:alnum:]]{5}`).join("|");
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

export class DaemonSetApi extends KubeApi<DaemonSet> {
  constructor(args: SpecificApiOptions<DaemonSet> = {}) {
    super({
      ...args,
      objectConstructor: DaemonSet,
    });
  }
}
