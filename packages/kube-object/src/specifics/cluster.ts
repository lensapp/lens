/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";

export enum ClusterStatus {
  ACTIVE = "Active",
  CREATING = "Creating",
  REMOVING = "Removing",
  ERROR = "Error",
}

export interface Cluster {
  spec: {
    clusterNetwork?: {
      serviceDomain?: string;
      pods?: {
        cidrBlocks?: string[];
      };
      services?: {
        cidrBlocks?: string[];
      };
    };
    providerSpec: {
      value: {
        profile: string;
      };
    };
  };
  status?: {
    apiEndpoints: {
      host: string;
      port: string;
    }[];
    providerStatus: {
      adminUser?: string;
      adminPassword?: string;
      kubeconfig?: string;
      processState?: string;
      lensAddress?: string;
    };
    errorMessage?: string;
    errorReason?: string;
  };
}

export class Cluster extends KubeObject {
  static kind = "Cluster";

  static apiBase = "/apis/cluster.k8s.io/v1alpha1/clusters";

  static namespaced = true;

  getStatus() {
    if (this.metadata.deletionTimestamp) {
      return ClusterStatus.REMOVING;
    }

    if (!this.status || !this.status) {
      return ClusterStatus.CREATING;
    }

    if (this.status.errorMessage) {
      return ClusterStatus.ERROR;
    }

    return ClusterStatus.ACTIVE;
  }
}
