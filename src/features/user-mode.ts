import { Feature, FeatureStatus } from "../main/feature"
import {KubeConfig, RbacAuthorizationV1Api} from "@kubernetes/client-node"
import { Cluster } from "../main/cluster"

export class UserModeFeature extends Feature {
  name = 'user-mode';
  latestVersion = "v2.0.0"

  async install(cluster: Cluster): Promise<boolean> {
    return super.install(cluster)
  }

  async upgrade(cluster: Cluster): Promise<boolean> {
    return true
  }

  async featureStatus(kc: KubeConfig): Promise<FeatureStatus> {
    return new Promise<FeatureStatus>( async (resolve, reject) => {
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
        status.currentVersion = this.latestVersion
        status.canUpgrade = false
        resolve(status)
      } catch(error) {
        resolve(status)
      }
    });
  }

  async uninstall(cluster: Cluster): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      const rbacClient = cluster.proxyKubeconfig().makeApiClient(RbacAuthorizationV1Api)
      try {
        await rbacClient.deleteClusterRole("lens-user");
        await rbacClient.deleteClusterRoleBinding("lens-user");
        resolve(true);
      } catch(error) {
        reject(error);
      }
    });
  }
}
