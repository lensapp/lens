import { ClusterFeature, Store, K8sApi } from "@k8slens/extensions"
import semver from "semver"
import * as path from "path"

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

export class MetricsFeature extends ClusterFeature.Feature {
  name = "metrics"
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

  async install(cluster: Store.Cluster): Promise<void> {
    // Check if there are storageclasses
    const storageClassApi = K8sApi.forCluster(cluster, K8sApi.StorageClass)
    const scs = await storageClassApi.list()
    this.config.persistence.enabled = scs.some(sc => (
      sc.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true' ||
      sc.metadata?.annotations?.['storageclass.beta.kubernetes.io/is-default-class'] === 'true'
    ));

    const template = super.renderTemplates(path.join(__dirname, "../resources/"))
    console.log(template)
    super.applyResources(cluster, template)
  }

  async upgrade(cluster: Store.Cluster): Promise<void> {
    return this.install(cluster)
  }

  async featureStatus(cluster: Store.Cluster): Promise<ClusterFeature.FeatureStatus> {
    const status: ClusterFeature.FeatureStatus = {
      currentVersion: null,
      installed: false,
      latestVersion: this.latestVersion,
      canUpgrade: false, // Dunno yet
    };

    try {
      const statefulSet = K8sApi.forCluster(cluster, K8sApi.StatefulSet)
      const prometheus = await statefulSet.get({name: "prometheus", namespace: "lens-metrics"})
      console.log("prom", cluster)
      if (prometheus?.kind) {
        status.installed = true;
        status.currentVersion = prometheus.spec.template.spec.containers[0].image.split(":")[1];
        status.canUpgrade = semver.lt(status.currentVersion, this.latestVersion, true);
      }
    } catch {
      // ignore error
    }

    return status;
  }

  async uninstall(cluster: Store.Cluster): Promise<void> {
    const namespaceApi = K8sApi.forCluster(cluster, K8sApi.Namespace)
    const clusterRoleBindingApi = K8sApi.forCluster(cluster, K8sApi.ClusterRoleBinding)
    const clusterRoleApi = K8sApi.forCluster(cluster, K8sApi.ClusterRole)

    await namespaceApi.delete({name: "lens-metrics"})
    await clusterRoleBindingApi.delete({name: "lens-prometheus"})
    await clusterRoleApi.delete({name: "lens-prometheus"})  }
}
