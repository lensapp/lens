import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../cluster";

export class NodesCountDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.NODES_COUNT

  public async detect() {
    if (!this.cluster.accessible) return null;
    const nodeCount = await this.getNodeCount()
    return { value: nodeCount, accuracy: 100}
  }

  protected async getNodeCount(): Promise<number> {
    const response = await this.k8sRequest("/api/v1/nodes")
    return response.items.length
  }
}