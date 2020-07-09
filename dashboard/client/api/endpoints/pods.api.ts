import { Affinity, WorkloadKubeObject } from "../workload-kube-object";
import { autobind } from "../../utils";
import { Metrics, metricsApi } from "./metrics.api";
import { KubeApi } from "../kube-api";

export class PodsApi extends KubeApi<Pod> {
  async getLogs(params: { namespace: string; name: string }, query?: PodLogsQuery): Promise<string> {
    const path = this.getUrl(params) + "/log";
    return this.request.get(path, { query });
  }

  getMetrics(pods: Pod[], namespace: string, selector = "pod, namespace"): Promise<PodMetricsData> {
    const podSelector = pods.map(pod => pod.getName()).join("|");
    const opts = { category: "pods", pods: podSelector, namespace, selector };

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

export interface PodMetricsData<T = Metrics> {
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

export interface PodLogsQuery {
  container?: string;
  tailLines?: number;
  timestamps?: boolean;
  sinceTime?: string; // Date.toISOString()-format
}

export enum PodStatus {
  TERMINATED = "Terminated",
  FAILED = "Failed",
  PENDING = "Pending",
  RUNNING = "Running",
  SUCCEEDED = "Succeeded",
  EVICTED = "Evicted"
}

export interface PodContainer {
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
  livenessProbe?: ContainerProbe;
  readinessProbe?: ContainerProbe;
  imagePullPolicy: string;
}

interface ContainerProbe {
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

export interface PodContainerStatus {
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
  lastState: {};
  ready: boolean;
  restartCount: number;
  image: string;
  imageID: string;
  containerID: string;
}

@autobind()
export class Pod extends WorkloadKubeObject {
  static kind = "Pod"

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
    initContainers: PodContainer[];
    containers: PodContainer[];
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
    affinity: Affinity;
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
    initContainerStatuses?: PodContainerStatus[];
    containerStatuses?: PodContainerStatus[];
    qosClass: string;
    reason?: string;
  }

  getAllContainers(): PodContainer[] {
    return this.spec.containers.concat(this.spec.initContainers);
  }

  getRunningContainers(): PodContainer[] {
    const activeContainers = new Set(
      this.getContainerStatuses()
        .filter(({ state }) => !!state.running)
        .map(({ name }) => name)
    );

    return this.getAllContainers()
      .filter(({ name }) => activeContainers.has(name));
  }

  getContainerStatuses(includeInitContainers = true): PodContainerStatus[] {
    const statuses: PodContainerStatus[] = [];
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
    if (!containerStatuses) {
      return 0;
    }
    return containerStatuses.reduce((count, item) => count + item.restartCount, 0);
  }

  getReason(): string {
    return this.status.reason || "";
  }

  // Returns one of 5 statuses: Running, Succeeded, Pending, Failed, Evicted
  getStatus(): PodStatus {
    const phase = this.status.phase;
    const reason = this.getReason();
    const goodConditions = ["Initialized", "Ready"].every(condition =>
      !!this.status.conditions.find(item => item.type === condition && item.status === "True")
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

  // Returns pod phase or container error if occured
  getStatusMessage(): string {
    if (this.getReason() === PodStatus.EVICTED) {
      return "Evicted";
    }
    if (this.getStatus() === PodStatus.RUNNING && this.metadata.deletionTimestamp) {
      return "Terminating";
    }

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
      });
    }
    if (message) {
      return message;
    }
    
    return this.status.phase;
  }

  getSecrets(): string[] {
    return this.spec.volumes
      .filter(vol => vol.secret)
      .map(vol => vol.secret.secretName);
  }

  getNodeSelectors(): string[] {
    const { nodeSelector } = this.spec;
    if (!nodeSelector) {
      return [];
    }
    return Object.entries(nodeSelector).map(values => values.join(": "));
  }

  hasIssues(): boolean {
    const notReady = !!this.status.conditions.find(condition => {
      return condition.type == "Ready" && condition.status !== "True";
    });
    const crashLoop = !!this.getContainerStatuses().find(condition => {
      const waiting = condition.state.waiting;
      return (waiting && waiting.reason == "CrashLoopBackOff");
    });
    return (
      notReady ||
      crashLoop ||
      this.status.phase !== "Running"
    );
  }

  getLivenessProbe(container: PodContainer): string[] {
    return this.getProbe(container.livenessProbe);
  }

  getReadinessProbe(container: PodContainer): string[] {
    return this.getProbe(container.readinessProbe);
  }

  getProbe(probeData: ContainerProbe): string[] {
    if (!probeData) {
      return [];
    }
    const {
      httpGet, exec, tcpSocket, initialDelaySeconds, timeoutSeconds,
      periodSeconds, successThreshold, failureThreshold
    } = probeData;
    const probe: string[] = [];
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

  getSelectedNodeOs(): string | null {
    return this.spec?.nodeSelector?.["kubernetes.io/os"] || this.spec?.nodeSelector?.["beta.kubernetes.io/os"] || null;
  }
}

export const podsApi = new PodsApi({
  kind: Pod.kind,
  apiBase: "/api/v1/pods",
  isNamespaced: true,
  objectConstructor: Pod,
});
