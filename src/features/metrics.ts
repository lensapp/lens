import { Feature, FeatureStatus } from "../main/feature"
import {KubeConfig, AppsV1Api, RbacAuthorizationV1Api} from "@kubernetes/client-node"
import semver from "semver"
import { Cluster } from "../main/cluster";
import * as k8s from "@kubernetes/client-node"

export interface MetricsConfiguration {
  // Placeholder for Metrics config structure
  persistence: {
    enabled: boolean;
    storageClass: string;
    size: string;
  };
  nodeExporter: {
    enabled: boolean;
  };
  kubeStateMetrics: {
    enabled: boolean;
  };
  retention: {
    time: string;
    size: string;
  };
  alertManagers: string[];
  replicas: number;
  storageClass: string;
}

export class MetricsFeature extends Feature {
  name = 'metrics';
  latestVersion = "v2.17.2-lens1"

  config: MetricsConfiguration = {
    persistence: {
      enabled: false,
      storageClass: null,
      size: "20G",
    },
    nodeExporter: {
      enabled: true,
    },
    retention: {
      time: "2d",
      size: "5GB",
    },
    kubeStateMetrics: {
      enabled: true,
    },
    alertManagers: null,
    replicas: 1,
    storageClass: null,
  };

  async install(cluster: Cluster): Promise<boolean> {
    // Check if there are storageclasses
    const storageClient = cluster.proxyKubeconfig().makeApiClient(k8s.StorageV1Api)
    const scs = await storageClient.listStorageClass();
    scs.body.items.forEach(sc => {
      if(sc.metadata.annotations &&
          (sc.metadata.annotations['storageclass.kubernetes.io/is-default-class'] === 'true' || sc.metadata.annotations['storageclass.beta.kubernetes.io/is-default-class'] === 'true')) {
        this.config.persistence.enabled = true;
      }
    });

    return super.install(cluster)
  }

  async upgrade(cluster: Cluster): Promise<boolean> {
    return this.install(cluster)
  }

  async featureStatus(kc: KubeConfig): Promise<FeatureStatus> {
    return new Promise<FeatureStatus>( async (resolve, reject) => {
      const client = kc.makeApiClient(AppsV1Api)
      const status: FeatureStatus = {
        currentVersion: null,
        installed: false,
        latestVersion: this.latestVersion,
        canUpgrade: false, // Dunno yet
      };
      try {

        const prometheus = (await client.readNamespacedStatefulSet('prometheus', 'lens-metrics')).body;
        status.installed = true;
        status.currentVersion = prometheus.spec.template.spec.containers[0].image.split(":")[1];
        status.canUpgrade = semver.lt(status.currentVersion, this.latestVersion, true);
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
        await this.deleteNamespace(cluster.proxyKubeconfig(), "lens-metrics")
        await rbacClient.deleteClusterRole("lens-prometheus");
        await rbacClient.deleteClusterRoleBinding("lens-prometheus");
        resolve(true);
      } catch(error) {
        reject(error);
      }
    });
  }

}
