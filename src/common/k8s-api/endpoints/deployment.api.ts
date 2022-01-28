/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";

import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { autoBind } from "../../utils";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { IPodMetrics } from "./pod.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { LabelSelector } from "../kube-object";

export function getMetricsForDeployments(deployments: Deployment[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = deployments.map(deployment => `${deployment.getName()}-[[:alnum:]]{9,}-[[:alnum:]]{5}`).join("|");
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

interface IContainerProbe {
  httpGet?: {
    path?: string;
    port: number;
    scheme: string;
    host?: string;
  };
  exec?: {
    command: string[];
  };
  tcpSocket?: {
    port: number;
  };
  initialDelaySeconds?: number;
  timeoutSeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

export class Deployment extends WorkloadKubeObject {
  static kind = "Deployment";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/deployments";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  declare spec: {
    replicas: number;
    selector: LabelSelector;
    template: {
      metadata: {
        creationTimestamp?: string;
        labels: { [app: string]: string };
        annotations?: { [app: string]: string };
      };
      spec: {
        containers: {
          name: string;
          image: string;
          args?: string[];
          ports?: {
            name: string;
            containerPort: number;
            protocol: string;
          }[];
          env?: {
            name: string;
            value: string;
          }[];
          resources: {
            limits?: {
              cpu: string;
              memory: string;
            };
            requests: {
              cpu: string;
              memory: string;
            };
          };
          volumeMounts?: {
            name: string;
            mountPath: string;
          }[];
          livenessProbe?: IContainerProbe;
          readinessProbe?: IContainerProbe;
          startupProbe?: IContainerProbe;
          terminationMessagePath: string;
          terminationMessagePolicy: string;
          imagePullPolicy: string;
        }[];
        restartPolicy: string;
        terminationGracePeriodSeconds: number;
        dnsPolicy: string;
        affinity?: IAffinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        serviceAccountName: string;
        serviceAccount: string;
        securityContext: {};
        schedulerName: string;
        tolerations?: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
        volumes?: {
          name: string;
          configMap: {
            name: string;
            defaultMode: number;
            optional: boolean;
          };
        }[];
      };
    };
    strategy: {
      type: string;
      rollingUpdate: {
        maxUnavailable: number;
        maxSurge: number;
      };
    };
  };
  declare status: {
    observedGeneration: number;
    replicas: number;
    updatedReplicas: number;
    readyReplicas: number;
    availableReplicas?: number;
    unavailableReplicas?: number;
    conditions: {
      type: string;
      status: string;
      lastUpdateTime: string;
      lastTransitionTime: string;
      reason: string;
      message: string;
    }[];
  };

  getConditions(activeOnly = false) {
    const { conditions } = this.status;

    if (!conditions) return [];

    if (activeOnly) {
      return conditions.filter(c => c.status === "True");
    }

    return conditions;
  }

  getConditionsText(activeOnly = true) {
    return this.getConditions(activeOnly).map(({ type }) => type).join(" ");
  }

  getReplicas() {
    return this.spec.replicas || 0;
  }
}

interface ReplicasStatus {
  status?: {
    replicas: number;
  }
}

export class DeploymentApi extends KubeApi<Deployment> {
  constructor(args: SpecificApiOptions<Deployment> = {}) {
    super({
      ...args,
      objectConstructor: Deployment,
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

  restart(params: { namespace: string; name: string }) {
    return this.request.patch(this.getUrl(params), {
      data: {
        spec: {
          template: {
            metadata: {
              annotations: { "kubectl.kubernetes.io/restartedAt" : moment.utc().format() },
            },
          },
        },
      },
    },
    {
      headers: {
        "content-type": "application/strategic-merge-patch+json",
      },
    });
  }
}
