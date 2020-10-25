import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../cluster";

export class VersionDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.VERSION
  value: string

  public async detect() {
    const version = await this.getKubernetesVersion()
    return { value: version, accuracy: 100}
  }

  public async getKubernetesVersion() {
    const response = await this.k8sRequest("/version")
    return response.gitVersion
  }
}