import { Feature, FeatureStatus } from "../main/feature"
import {KubeConfig, RbacAuthorizationV1Api} from "@kubernetes/client-node"
import { Cluster } from "../main/cluster"

export class UserModeFeature extends Feature {
  static id = 'user-mode'
  name = UserModeFeature.id;
  latestVersion = "v2.0.0"

  async install(cluster: Cluster): Promise<void> {
    return super.install(cluster)
  }

  async upgrade(cluster: Cluster): Promise<void> {
    return;
  }

  async featureStatus(kc: KubeConfig): Promise<FeatureStatus> {
    const client = kc.makeApiClient(RbacAuthorizationV1Api)
    const status: FeatureStatus = {
      currentVersion: null,
      installed: false,
      latestVersion: this.latestVersion,
      canUpgrade: false, // Dunno yet
    };
    
    try {
      await client.readClusterRoleBinding("lens-user")
      status.installed = true;
      status.currentVersion = this.latestVersion;
      status.canUpgrade = false;
    } catch {
      // ignore error
    }

    return status;
  }

  async uninstall(cluster: Cluster): Promise<void> {
    const rbacClient = cluster.getProxyKubeconfig().makeApiClient(RbacAuthorizationV1Api)
    await rbacClient.deleteClusterRole("lens-user");
    await rbacClient.deleteClusterRoleBinding("lens-user");
  }
}
