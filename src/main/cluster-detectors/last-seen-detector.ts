import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../cluster";

export class LastSeenDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.LAST_SEEN

  public async detect() {
    if (!this.cluster.accessible) return null;

    await this.k8sRequest("/version")
    return { value: new Date().toJSON(), accuracy: 100 }
  }
}