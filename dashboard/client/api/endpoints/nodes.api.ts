import { KubeObject } from "../kube-object";
import { autobind, cpuUnitsToNumber, unitsToBytes } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
import { KubeApi } from "../kube-api";

export class NodesApi extends KubeApi<Node> {
  getMetrics(): Promise<INodeMetrics> {
    const memoryUsage = `
        sum (
          node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)
        ) by (kubernetes_node)
      `;
    const memoryCapacity = `sum(kube_node_status_capacity{resource="memory"}) by (node)`;
    const cpuUsage = `sum(rate(node_cpu_seconds_total{mode=~"user|system"}[1m])) by(kubernetes_node)`;
    const cpuCapacity = `sum(kube_node_status_allocatable{resource="cpu"}) by (node)`;
    const fsSize = `sum(node_filesystem_size_bytes{mountpoint="/"}) by (kubernetes_node)`;
    const fsUsage = `sum(node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_avail_bytes{mountpoint="/"}) by (kubernetes_node)`;

    return metricsApi.getMetrics({
      memoryUsage,
      memoryCapacity,
      cpuUsage,
      cpuCapacity,
      fsSize,
      fsUsage
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

@autobind()
export class Node extends KubeObject {
  static kind = "Node"

  spec: {
    podCIDR: string;
    externalID: string;
    taints?: {
      key: string;
      value: string;
      effect: string;
    }[];
    unschedulable?: boolean;
  }
  status: {
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

  getNodeConditionText() {
    const { conditions } = this.status
    if (!conditions) return ""
    return conditions.reduce((types, current) => {
      if (current.status !== "True") return ""
      return types += ` ${current.type}`
    }, "")
  }

  getTaints() {
    return this.spec.taints || [];
  }

  getRoleLabels() {
    const roleLabels = Object.keys(this.metadata.labels).filter(key =>
      key.includes("node-role.kubernetes.io")
    ).map(key => key.match(/([^/]+$)/)[0]) // all after last slash
    return roleLabels.join(", ")
  }

  getCpuCapacity() {
    if (!this.status.capacity || !this.status.capacity.cpu) return 0
    return cpuUnitsToNumber(this.status.capacity.cpu)
  }

  getMemoryCapacity() {
    if (!this.status.capacity || !this.status.capacity.memory) return 0
    return unitsToBytes(this.status.capacity.memory)
  }

  getConditions() {
    const conditions = this.status.conditions || [];
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
    return this.status.nodeInfo.kubeletVersion;
  }

  isUnschedulable() {
    return this.spec.unschedulable
  }
}

export const nodesApi = new NodesApi({
  kind: Node.kind,
  apiBase: "/api/v1/nodes",
  isNamespaced: false,
  objectConstructor: Node,
});
