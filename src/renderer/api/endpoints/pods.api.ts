import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { autobind } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
import { KubeApi } from "../kube-api";

export class PodsApi extends KubeApi<Pod> {
  async getLogs(params: { namespace: string; name: string }, query?: IPodLogsQuery): Promise<string> {
    const path = this.getUrl(params) + "/log";
    return this.request.get(path, { query });
  }

  getMetrics(pods: Pod[], namespace: string, selector = "pod, namespace"): Promise<IPodMetrics> {
    const podSelector = pods.map(pod => pod.getName()).join("|");
    const opts = { category: "pods", pods: podSelector, namespace, selector }

    return metricsApi.getMetrics({
      cpuUsage: opts,
      cpuRequests: opts,
      cpuLimits: opts,
      memoryUsage: opts,
      memoryRequests: opts,
      memoryLimits: opts,
      fsUsage: opts,
      networkReceive: opts,
      networkTransmit: opts,
    }, {
      namespace,
    });
  }
}

export interface IPodMetrics<T = IMetrics> {
  [metric: string]: T;
  cpuUsage: T;
  cpuRequests: T;
  cpuLimits: T;
  memoryUsage: T;
  memoryRequests: T;
  memoryLimits: T;
  fsUsage: T;
  networkReceive: T;
  networkTransmit: T;
}

// Reference: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#read-log-pod-v1-core
export interface IPodLogsQuery {
  container?: string;
  tailLines?: number;
  timestamps?: boolean;
  sinceTime?: string; // Date.toISOString()-format
  follow?: boolean;
  previous?: boolean;
}

export enum PodStatus {
  TERMINATED = "Terminated",
  FAILED = "Failed",
  PENDING = "Pending",
  RUNNING = "Running",
  SUCCEEDED = "Succeeded",
  EVICTED = "Evicted"
}

export interface IPodContainer {
  name: string;
  image: string;
  command?: string[];
  args?: string[];
  ports: {
    name?: string;
    containerPort: number;
    protocol: string;
  }[];
  resources?: {
    limits: {
      cpu: string;
      memory: string;
    };
    requests: {
      cpu: string;
      memory: string;
    };
  };
  env?: {
    name: string;
    value?: string;
    valueFrom?: {
      fieldRef?: {
        apiVersion: string;
        fieldPath: string;
      };
      secretKeyRef?: {
        key: string;
        name: string;
      };
      configMapKeyRef?: {
        key: string;
        name: string;
      };
    };
  }[];
  envFrom?: {
    configMapRef?: {
      name: string;
    };
  }[];
  volumeMounts?: {
    name: string;
    readOnly: boolean;
    mountPath: string;
  }[];
  livenessProbe?: IContainerProbe;
  readinessProbe?: IContainerProbe;
  imagePullPolicy: string;
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

export interface IPodContainerStatus {
  name: string;
  state: {
    [index: string]: object;
    running?: {
      startedAt: string;
    };
    waiting?: {
      reason: string;
      message: string;
    };
    terminated?: {
      startedAt: string;
      finishedAt: string;
      exitCode: number;
      reason: string;
    };
  };
  lastState: {
    [index: string]: object;
    terminated?: {
      startedAt: string;
      finishedAt: string;
      exitCode: number;
      reason: string;
      containerID: string;
    };
  };
  ready: boolean;
  restartCount: number;
  image: string;
  imageID: string;
  containerID: string;
}

@autobind()
export class Pod extends WorkloadKubeObject {
  static kind = "Pod"
  static namespaced = true
  static apiBase = "/api/v1/pods"

  spec: {
    volumes?: {
      name: string;
      persistentVolumeClaim: {
        claimName: string;
      };
      emptyDir: {
        medium?: string;
        sizeLimit?: string;
      };
      configMap: {
        name: string;
      };
      secret: {
        secretName: string;
        defaultMode: number;
      };
    }[];
    initContainers: IPodContainer[];
    containers: IPodContainer[];
    restartPolicy: string;
    terminationGracePeriodSeconds: number;
    dnsPolicy: string;
    serviceAccountName: string;
    serviceAccount: string;
    priority: number;
    priorityClassName: string;
    nodeName: string;
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
    affinity: IAffinity;
  }
  status: {
    phase: string;
    conditions: {
      type: string;
      status: string;
      lastProbeTime: number;
      lastTransitionTime: string;
    }[];
    hostIP: string;
    podIP: string;
    startTime: string;
    initContainerStatuses?: IPodContainerStatus[];
    containerStatuses?: IPodContainerStatus[];
    qosClass: string;
    reason?: string;
  }

  getInitContainers() {
    return this.spec.initContainers || [];
  }

  getContainers() {
    return this.spec.containers || [];
  }

  getAllContainers() {
    return this.getContainers().concat(this.getInitContainers());
  }

  getRunningContainers() {
    const statuses = this.getContainerStatuses()
    return this.getAllContainers().filter(container => {
      return statuses.find(status => status.name === container.name && !!status.state["running"])
    }
    )
  }

  getContainerStatuses(includeInitContainers = true) {
    const statuses: IPodContainerStatus[] = [];
    const { containerStatuses, initContainerStatuses } = this.status;
    if (containerStatuses) {
      statuses.push(...containerStatuses);
    }
    if (includeInitContainers && initContainerStatuses) {
      statuses.push(...initContainerStatuses);
    }
    return statuses;
  }

  getRestartsCount(): number {
    const { containerStatuses } = this.status;
    if (!containerStatuses) return 0;
    return containerStatuses.reduce((count, item) => count + item.restartCount, 0);
  }

  getQosClass() {
    return this.status.qosClass || "";
  }

  getReason() {
    return this.status.reason || "";
  }

  getPriorityClassName() {
    return this.spec.priorityClassName || "";
  }

  // Returns one of 5 statuses: Running, Succeeded, Pending, Failed, Evicted
  getStatus() {
    const phase = this.getStatusPhase();
    const reason = this.getReason();
    const goodConditions = ["Initialized", "Ready"].every(condition =>
      !!this.getConditions().find(item => item.type === condition && item.status === "True")
    );
    if (reason === PodStatus.EVICTED) {
      return PodStatus.EVICTED;
    }
    if (phase === PodStatus.FAILED) {
      return PodStatus.FAILED;
    }
    if (phase === PodStatus.SUCCEEDED) {
      return PodStatus.SUCCEEDED;
    }
    if (phase === PodStatus.RUNNING && goodConditions) {
      return PodStatus.RUNNING;
    }
    return PodStatus.PENDING;
  }

  // Returns pod phase or container error if occurred
  getStatusMessage() {
    if (this.getReason() === PodStatus.EVICTED) return "Evicted";
    if (this.getStatus() === PodStatus.RUNNING && this.metadata.deletionTimestamp) return "Terminating";

    let message = "";
    const statuses = this.getContainerStatuses(false); // not including initContainers
    if (statuses.length) {
      statuses.forEach(status => {
        const { state } = status;
        if (state.waiting) {
          const { reason } = state.waiting;
          message = reason ? reason : "Waiting";
        }
        if (state.terminated) {
          const { reason } = state.terminated;
          message = reason ? reason : "Terminated";
        }
      })
    }
    if (message) return message;
    return this.getStatusPhase();
  }

  getStatusPhase() {
    return this.status.phase;
  }

  getConditions() {
    return this.status.conditions || [];
  }

  getVolumes() {
    return this.spec.volumes || [];
  }

  getSecrets(): string[] {
    return this.getVolumes()
      .filter(vol => vol.secret)
      .map(vol => vol.secret.secretName);
  }

  getNodeSelectors(): string[] {
    const { nodeSelector } = this.spec
    if (!nodeSelector) return []
    return Object.entries(nodeSelector).map(values => values.join(": "))
  }

  getTolerations() {
    return this.spec.tolerations || []
  }

  getAffinity(): IAffinity {
    return this.spec.affinity
  }

  hasIssues() {
    const notReady = !!this.getConditions().find(condition => {
      return condition.type == "Ready" && condition.status !== "True"
    });
    const crashLoop = !!this.getContainerStatuses().find(condition => {
      const waiting = condition.state.waiting
      return (waiting && waiting.reason == "CrashLoopBackOff")
    })
    return (
      notReady ||
      crashLoop ||
      this.getStatusPhase() !== "Running"
    )
  }

  getLivenessProbe(container: IPodContainer) {
    return this.getProbe(container.livenessProbe);
  }

  getReadinessProbe(container: IPodContainer) {
    return this.getProbe(container.readinessProbe);
  }

  getProbe(probeData: IContainerProbe) {
    if (!probeData) return [];
    const {
      httpGet, exec, tcpSocket, initialDelaySeconds, timeoutSeconds,
      periodSeconds, successThreshold, failureThreshold
    } = probeData;
    const probe = [];
    // HTTP Request
    if (httpGet) {
      const { path, port, host, scheme } = httpGet;
      probe.push(
        "http-get",
        `${scheme.toLowerCase()}://${host || ""}:${port || ""}${path || ""}`,
      );
    }
    // Command
    if (exec && exec.command) {
      probe.push(`exec [${exec.command.join(" ")}]`);
    }
    // TCP Probe
    if (tcpSocket && tcpSocket.port) {
      probe.push(`tcp-socket :${tcpSocket.port}`);
    }
    probe.push(
      `delay=${initialDelaySeconds || "0"}s`,
      `timeout=${timeoutSeconds || "0"}s`,
      `period=${periodSeconds || "0"}s`,
      `#success=${successThreshold || "0"}`,
      `#failure=${failureThreshold || "0"}`,
    );
    return probe;
  }

  getNodeName() {
    return this.spec?.nodeName
  }

  getSelectedNodeOs() {
    if (!this.spec.nodeSelector) return
    if (!this.spec.nodeSelector["kubernetes.io/os"] && !this.spec.nodeSelector["beta.kubernetes.io/os"]) return

    return this.spec.nodeSelector["kubernetes.io/os"] || this.spec.nodeSelector["beta.kubernetes.io/os"]
  }
}

export const podsApi = new PodsApi({
  objectConstructor: Pod,
});
