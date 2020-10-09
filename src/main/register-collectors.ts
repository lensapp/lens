import { clusterMetaManager } from "../common/cluster-meta-manager";
import { Distribution } from "../common/meta-collectors/distribution";

export function registerCollectors() {
  clusterMetaManager.registerCollector("distribution", Distribution)
}
