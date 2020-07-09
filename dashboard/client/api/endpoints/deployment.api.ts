import { Affinity, WorkloadKubeObject } from "../workload-kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";
import { CancelablePromise } from "client/utils/cancelableFetch";
import { KubeJsonApiData } from "../kube-json-api";

export class DeploymentApi extends KubeApi<Deployment> {
  protected getScaleApiUrl(params: { namespace: string; name: string }): string {
    return this.getUrl(params) + "/scale";
  }

  async getReplicas(params: { namespace: string; name: string }): Promise<number> {
    const { status } = await this.request.get(this.getScaleApiUrl(params));
    return status.replicas;
  }

  scale(metadata: { namespace: string; name: string }, replicas: number): CancelablePromise<KubeJsonApiData> {
    return this.request.put(
      this.getScaleApiUrl(metadata), 
      { data: { metadata, spec: { replicas } } }
    );
  }
}

@autobind()
export class Deployment extends WorkloadKubeObject {
  static kind = "Deployment"

  spec: {
    replicas: number;
    selector: { matchLabels: { [app: string]: string } };
    template: {
      metadata: {
        creationTimestamp?: string;
        labels: { [app: string]: string };
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
          livenessProbe?: {
            httpGet: {
              path: string;
              port: number;
              scheme: string;
            };
            initialDelaySeconds: number;
            timeoutSeconds: number;
            periodSeconds: number;
            successThreshold: number;
            failureThreshold: number;
          };
          readinessProbe?: {
            httpGet: {
              path: string;
              port: number;
              scheme: string;
            };
            initialDelaySeconds: number;
            timeoutSeconds: number;
            periodSeconds: number;
            successThreshold: number;
            failureThreshold: number;
          };
          terminationMessagePath: string;
          terminationMessagePolicy: string;
          imagePullPolicy: string;
        }[];
        restartPolicy: string;
        terminationGracePeriodSeconds: number;
        dnsPolicy: string;
        affinity?: Affinity;
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
  status: {
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

  getConditions(activeOnly = false): Deployment["status"]["conditions"] {
    return this.status.conditions.filter(({ status }) => !activeOnly || status === "True");
  }

  getConditionsText(activeOnly = true): string {
    return this.getConditions(activeOnly).map(({ type }) => type).join(" ");
  }

  getReplicas(): number {
    return this.spec.replicas || 0;
  }
}

export const deploymentApi = new DeploymentApi({
  kind: Deployment.kind,
  apiBase: "/apis/apps/v1/deployments",
  isNamespaced: true,
  objectConstructor: Deployment,
});
