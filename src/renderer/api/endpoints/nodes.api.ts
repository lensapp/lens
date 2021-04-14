import { KubeObject } from "../kube-object";
import { autobind, cpuUnitsToNumber, NotFalsy, unitsToBytes } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
import { KubeApi } from "../kube-api";

export class NodesApi extends KubeApi<NodeSpec, NodeStatus, Node> {
  getMetrics(): Promise<INodeMetrics> {
    const opts = { category: "nodes"};

    return metricsApi.getMetrics({
      memoryUsage: opts,
      memoryCapacity: opts,
      cpuUsage: opts,
      cpuCapacity: opts,
      fsSize: opts,
      fsUsage: opts
    });
  }
}

export interface INodeMetrics<T = IMetrics> {
  [metric: string]: T;
  memoryUsage: T;
  memoryCapacity: T;
  cpuUsage: T;
  cpuCapacity: T;
  fsUsage: T;
  fsSize: T;
}

interface NodeSpec {
  podCIDR: string;
  externalID: string;
  taints?: {
    key: string;
    value: string;
    effect: string;
  }[];
  unschedulable?: boolean;
}

interface NodeStatus {
  capacity: {
    cpu: string;
    memory: string;
    pods: string;
  };
  allocatable: {
    cpu: string;
    memory: string;
    pods: string;
  };
  conditions: {
    type: string;
    status?: string;
    lastHeartbeatTime?: string;
    lastTransitionTime?: string;
    reason?: string;
    message?: string;
  }[];
  addresses: {
    type: string;
    address: string;
  }[];
  nodeInfo: {
    machineID: string;
    systemUUID: string;
    bootID: string;
    kernelVersion: string;
    osImage: string;
    containerRuntimeVersion: string;
    kubeletVersion: string;
    kubeProxyVersion: string;
    operatingSystem: string;
    architecture: string;
  };
  images: {
    names: string[];
    sizeBytes: number;
  }[];
}

@autobind()
export class Node extends KubeObject<NodeSpec, NodeStatus> {
  static kind = "Node";
  static namespaced = false;
  static apiBase = "/api/v1/nodes";

  getNodeConditionText() {
    if (this.status?.conditions) {
      return this.status.conditions
        .filter(condition => condition.status === "True")
        .map(condition => condition.type)
        .join(" ");
    }

    return "";
  }

  getTaints() {
    return this.spec?.taints ?? [];
  }

  getRoleLabels() {
    const roleLabels = Object.keys(this.metadata.labels ?? {})
      .filter(key => key.includes("node-role.kubernetes.io"))
      .map(key => key.match(/([^/]+$)/)?.[0])
      .filter(NotFalsy); // all after last slash

    if (this.metadata.labels?.["kubernetes.io/role"]) {
      roleLabels.push(this.metadata.labels["kubernetes.io/role"]);
    }

    return roleLabels.join(", ");
  }

  getCpuCapacity() {
    if (!this.status?.capacity.cpu) return 0;

    return cpuUnitsToNumber(this.status.capacity.cpu);
  }

  getMemoryCapacity() {
    if (!this.status?.capacity.memory) return 0;

    return unitsToBytes(this.status.capacity.memory);
  }

  getConditions() {
    const conditions = this.status?.conditions ?? [];

    if (this.isUnschedulable()) {
      return [{ type: "SchedulingDisabled", status: "True" }, ...conditions];
    }

    return conditions;
  }

  getActiveConditions() {
    return this.getConditions().filter(c => c.status === "True");
  }

  getWarningConditions() {
    const goodConditions = ["Ready", "HostUpgrades", "SchedulingDisabled"];

    return this.getActiveConditions().filter(condition => {
      return !goodConditions.includes(condition.type);
    });
  }

  getKubeletVersion() {
    return this.status?.nodeInfo.kubeletVersion;
  }

  getOperatingSystem(): string {
    const label = this.getLabels().find(label => label.startsWith("kubernetes.io/os="));

    return label?.split("=", 2)[1] ?? "linux";
  }

  isUnschedulable() {
    return this.spec?.unschedulable ?? false;
  }
}

export const nodesApi = new NodesApi({
  objectConstructor: Node,
});
