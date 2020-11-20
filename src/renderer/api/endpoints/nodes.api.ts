import { KubeObject } from "../kube-object";
import { autobind, cpuUnitsToNumber, unitsToBytes } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
import { KubeApi } from "../kube-api";

export class NodesApi extends KubeApi<Node> {
  getMetrics(): Promise<INodeMetrics> {
    const opts = { category: "nodes"}

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

@autobind()
export class Node extends KubeObject {
  static kind = "Node"
  static namespaced = false
  static apiBase = "/api/v1/nodes"

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

    if (this.metadata.labels["kubernetes.io/role"] != undefined) {
      roleLabels.push(this.metadata.labels["kubernetes.io/role"])
    }

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

  getOperatingSystem(): string {
    const label = this.getLabels().find(label => label.startsWith("kubernetes.io/os="))
    if (label) {
      return label.split("=", 2)[1]
    }

    return "linux"
  }

  isUnschedulable() {
    return this.spec.unschedulable
  }
}

export const nodesApi = new NodesApi({
  objectConstructor: Node,
});
