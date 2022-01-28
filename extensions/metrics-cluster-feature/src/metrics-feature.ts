/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer, Common } from "@k8slens/extensions";
import semver from "semver";
import * as path from "path";

const { ResourceStack, forCluster, StorageClass, Namespace } = Renderer.K8sApi;

type ResourceStack = Renderer.K8sApi.ResourceStack;

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
  version?: string;
}

export interface MetricsStatus {
  installed: boolean;
  canUpgrade: boolean;
}

export class MetricsFeature {
  name = "lens-metrics";
  latestVersion = "v2.26.0-lens1";

  protected stack: ResourceStack;

  constructor(protected cluster: Common.Catalog.KubernetesCluster) {
    this.stack = new ResourceStack(cluster, this.name);
  }

  get resourceFolder() {
    return path.join(__dirname, "../resources/");
  }

  async install(config: MetricsConfiguration): Promise<string> {
    // Check if there are storageclasses
    const storageClassApi = forCluster(this.cluster, StorageClass);
    const scs = await storageClassApi.list();

    config.persistence.enabled = scs.some(sc => (
      sc.metadata?.annotations?.["storageclass.kubernetes.io/is-default-class"] === "true" ||
      sc.metadata?.annotations?.["storageclass.beta.kubernetes.io/is-default-class"] === "true"
    ));

    config.version = this.latestVersion;

    return this.stack.kubectlApplyFolder(this.resourceFolder, config, ["--prune"]);
  }

  upgrade(config: MetricsConfiguration): Promise<string> {
    return this.install(config);
  }

  async getStatus(): Promise<MetricsStatus> {
    const status: MetricsStatus = { installed: false, canUpgrade: false };

    try {
      const namespaceApi = forCluster(this.cluster, Namespace);
      const namespace = await namespaceApi.get({ name: "lens-metrics" });

      if (namespace?.kind) {
        const currentVersion = namespace.metadata.annotations?.extensionVersion || "0.0.0";

        status.installed = true;
        status.canUpgrade = semver.lt(currentVersion, this.latestVersion, true);
      } else {
        status.installed = false;
      }
    } catch(e) {
      if (e?.error?.code === 404) {
        status.installed = false;
      } else {
        console.warn("[LENS-METRICS] failed to resolve install state", e);
      }
    }

    return status;
  }

  uninstall(config: MetricsConfiguration): Promise<string> {
    return this.stack.kubectlDeleteFolder(this.resourceFolder, config);
  }
}
