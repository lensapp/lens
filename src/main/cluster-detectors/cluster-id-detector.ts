import { BaseClusterDetector } from "./base-cluster-detector";
import { createHash } from "crypto";
import { ClusterMetadataKey } from "../cluster";
import { assert, NotFalsy } from "../../common/utils";

export class ClusterIdDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.CLUSTER_ID;

  public async detect() {
    let id: string;

    try {
      id = await this.getDefaultNamespaceId();
    } catch(_) {
      id = assert(this.cluster.apiUrl, "ClusterIdDetector can only detect for valid Cluster instances");
    }
    const value = createHash("sha256").update(id).digest("hex");

    return { value, accuracy: 100 };
  }

  protected async getDefaultNamespaceId() {
    const response = await this.k8sRequest("/api/v1/namespaces/default");

    return response.metadata.uid;
  }
}
