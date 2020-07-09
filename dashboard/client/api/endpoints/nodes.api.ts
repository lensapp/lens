import { KubeObject } from "../kube-object";
import { autobind, cpuUnitsToNumber, unitsToBytes } from "../../utils";
import { Metrics, metricsApi } from "./metrics.api";
import { KubeApi } from "../kube-api";

export class NodesApi extends KubeApi<Node> {
  getMetrics(): Promise<NodeMetrics> {
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

export interface NodeMetrics<T = Metrics> {
  [metric: string]: T;
  memoryUsage: T;
  memoryCapacity: T;
  cpuUsage: T;
  cpuCapacity: T;
  fsUsage: T;
  fsSize: T;
}

export interface NodeTaint {
  key: string;
  value: string;
  effect: string;
}

export interface NodeConditions {
  type: string;
  status?: string;
  lastHeartbeatTime?: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

@autobind()
export class Node extends KubeObject {
  static kind = "Node"

  spec: {
    podCIDR: string;
    externalID: string;
    taints?: NodeTaint[];
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
    conditions: NodeConditions[];
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

  getNodeConditionText(): string {
    return this.status
      .conditions
      .filter(({status}) => status === "True")
      .map(({type}) => type)
      .join(" ");
  }

  getTaints(): NodeTaint[] {
    return this.spec.taints || [];
  }

  getRoleLabels(): string {
    const roleLabels = Object.keys(this.metadata.labels).filter(key =>
      key.includes("node-role.kubernetes.io")
    ).map(key => key.match(/([^/]+$)/)[0]); // all after last slash

    if (this.metadata.labels["kubernetes.io/role"] != undefined) {
      roleLabels.push(this.metadata.labels["kubernetes.io/role"]);
    }

    return roleLabels.join(", ");
  }

  getCpuCapacity(): number {
    if (!this.status.capacity || !this.status.capacity.cpu) {
      return 0;
    }
    return cpuUnitsToNumber(this.status.capacity.cpu);
  }

  getMemoryCapacity(): number {
    if (!this.status.capacity || !this.status.capacity.memory) {
      return 0;
    }
    return unitsToBytes(this.status.capacity.memory);
  }

  getConditions(): NodeConditions[] {
    if (this.isUnschedulable()) {
      return [{ type: "SchedulingDisabled", status: "True" }, ...this.status.conditions];
    }
    return this.status.conditions;
  }

  getActiveConditions(): NodeConditions[] {
    return this.getConditions().filter(c => c.status === "True");
  }

  getWarningConditions(): NodeConditions[] {
    const goodConditions = new Set(["Ready", "HostUpgrades", "SchedulingDisabled"]);
    return this.getActiveConditions().filter(condition => !goodConditions.has(condition.type));
  }

  getKubeletVersion(): string {
    return this.status.nodeInfo.kubeletVersion;
  }

  getOperatingSystem(): string {
    const label = this.getLabels().find(label => label.startsWith("kubernetes.io/os="));
    if (label) {
      return label.split("=", 2)[1];
    }

    return "linux";
  }

  isUnschedulable(): boolean {
    return this.spec.unschedulable;
  }
}

export const nodesApi = new NodesApi({
  kind: Node.kind,
  apiBase: "/api/v1/nodes",
  isNamespaced: false,
  objectConstructor: Node,
});
