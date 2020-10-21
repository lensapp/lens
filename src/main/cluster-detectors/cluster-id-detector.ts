import { BaseClusterDetector } from "./base-cluster-detector";
import { createHash } from "crypto"
import { ClusterMetadataKey } from "../cluster";

export class ClusterIdDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.CLUSTER_ID

  public async detect() {
    const id = createHash("sha256").update(this.cluster.apiUrl).digest("hex")
    return { value: id, accuracy: 100 }
  }
}