import { BaseClusterDetector } from "./base-cluster-detector";
import { createHash } from "crypto"
import { ClusterMetadataKey } from "../cluster";

export class ClusterIdDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.CLUSTER_ID

  public async detect() {
    let id: string
    try {
      id = await this.getDefaultNamespaceId()
    } catch(_) {
      id = this.cluster.apiUrl
    }
    const value = createHash("sha256").update(id).digest("hex")
    return { value: value, accuracy: 100 }
  }

  protected async getDefaultNamespaceId() {
    const response = await this.k8sRequest("/api/v1/namespaces/default")
    return response.metadata.uid
  }
}