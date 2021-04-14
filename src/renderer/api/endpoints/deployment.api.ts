import moment from "moment";

import { IAffinity, WorkloadKubeObject, WorkloadSpec } from "../workload-kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

export class DeploymentApi extends KubeApi<DeploymentSpec, DeploymentStatus, Deployment> {
  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.getUrl(params)}/scale`;
  }

  async getReplicas(params: { namespace: string; name: string }): Promise<number> {
    const { status } = await this.request.get(this.getScaleApiUrl(params));

    return status?.replicas ?? 0;
  }

  scale(params: { namespace: string; name: string }, replicas: number) {
    return this.request.put(this.getScaleApiUrl(params), {
      data: {
        metadata: params,
        spec: {
          replicas
        }
      }
    });
  }

  restart(params: { namespace: string; name: string }) {
    return this.request.patch(this.getUrl(params), {
      data: {
        spec: {
          template: {
            metadata: {
              annotations: {"kubectl.kubernetes.io/restartedAt" : moment.utc().format()}
            }
          }
        }
      }
    },
    {
      headers: {
        "content-type": "application/strategic-merge-patch+json"
      }
    });
  }
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

interface DeploymentSpec extends WorkloadSpec {
  replicas: number;
  template: {
    metadata: {
      creationTimestamp?: string;
      labels: {
        [app: string]: string;
      };
      annotations?: {
        [app: string]: string;
      };
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
}

interface DeploymentStatus {
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
}

@autobind()
export class Deployment extends WorkloadKubeObject<DeploymentSpec, DeploymentStatus> {
  static kind = "Deployment";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/deployments";

  getConditions(activeOnly = false) {
    const { conditions } = this.status ?? {};

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
    return this.spec?.replicas ?? 0;
  }
}

export const deploymentApi = new DeploymentApi({
  objectConstructor: Deployment,
});
