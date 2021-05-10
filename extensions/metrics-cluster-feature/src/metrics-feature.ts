import { Catalog, K8sApi } from "@k8slens/extensions";
import semver from "semver";
import * as path from "path";

export interface MetricsConfiguration {
  // Placeholder for Metrics config structure
  prometheus: {
    enabled: boolean;
  };
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

export interface MetricsStatus {
  installed: boolean;
  canUpgrade: boolean;
}

export class MetricsFeature {
  name = "metrics";
  latestVersion = "v2.19.3-lens1";

  protected stack: K8sApi.ResourceStack;

  constructor(protected cluster: Catalog.KubernetesCluster) {
    this.stack = new K8sApi.ResourceStack(cluster);
  }

  get resourceFolder() {
    return path.join(__dirname, "../resources/");
  }

  async install(config: MetricsConfiguration): Promise<string> {
    // Check if there are storageclasses
    const storageClassApi = K8sApi.forCluster(this.cluster, K8sApi.StorageClass);
    const scs = await storageClassApi.list();

    config.persistence.enabled = scs.some(sc => (
      sc.metadata?.annotations?.["storageclass.kubernetes.io/is-default-class"] === "true" ||
      sc.metadata?.annotations?.["storageclass.beta.kubernetes.io/is-default-class"] === "true"
    ));

    return this.stack.kubectlApplyFolder(this.resourceFolder, config);
  }

  async upgrade(config: MetricsConfiguration): Promise<string> {
    return this.install(config);
  }

  async getStatus(): Promise<MetricsStatus> {
    const status: MetricsStatus = { installed: false, canUpgrade: false};

    try {
      const statefulSet = K8sApi.forCluster(this.cluster, K8sApi.StatefulSet);
      const prometheus = await statefulSet.get({name: "prometheus", namespace: "lens-metrics"});

      if (prometheus?.kind) {
        const currentVersion = prometheus.spec.template.spec.containers[0].image.split(":")[1];

        status.installed = true;
        status.canUpgrade = semver.lt(currentVersion, this.latestVersion, true);
      } else {
        status.installed = false;
      }
    } catch(e) {
      if (e?.error?.code === 404) {
        status.installed = false;
      }
    }

    return status;
  }

  async uninstall(config: MetricsConfiguration): Promise<string> {
    return this.stack.kubectlDeleteFolder(this.resourceFolder, config);
  }
}
