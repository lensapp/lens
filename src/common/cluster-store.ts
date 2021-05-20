/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import path from "path";
import { app, ipcRenderer, remote } from "electron";
import { action, comparer, observable, toJS } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/cluster-store";
import { dumpConfigYaml } from "./kube-helpers";
import { saveToAppFiles } from "./utils/saveToAppFiles";
import type { KubeConfig } from "@kubernetes/client-node";
import { disposer } from "./utils";
import type { ResourceType } from "../renderer/components/cluster-settings/components/cluster-metrics-setting";

export interface ClusterIconUpload {
  clusterId: string;
  name: string;
  path: string;
}

export interface ClusterMetadata {
  [key: string]: string | number | boolean | object;
}

export type ClusterPrometheusMetadata = {
  success?: boolean;
  provider?: string;
  autoDetected?: boolean;
};

export interface ClusterStoreModel {
  preferences?: [string, ClusterPreferences][];
}

export type ClusterId = string;

export interface UpdateClusterModel extends Omit<ClusterModel, "id"> {
  id?: ClusterId;
}

export interface ClusterModel {
  /** Unique id for a cluster */
  id: ClusterId;

  /** Path to cluster kubeconfig */
  kubeConfigPath: string;

  /**
   * Workspace id
   *
   * @deprecated
  */
  workspace?: string;

  /** User context in kubeconfig  */
  contextName?: string;

  /** Preferences */
  preferences?: ClusterPreferences;

  /** Metadata */
  metadata?: ClusterMetadata;

  /** List of accessible namespaces */
  accessibleNamespaces?: string[];

  /** @deprecated */
  kubeConfig?: string; // yaml
}

export interface ClusterPreferences extends ClusterPrometheusPreferences {
  terminalCWD?: string;
  clusterName?: string;
  iconOrder?: number;
  icon?: string;
  httpsProxy?: string;
  hiddenMetrics?: string[];
}

export interface ClusterPrometheusPreferences {
  prometheus?: {
    namespace: string;
    service: string;
    port: number;
    prefix: string;
  };
  prometheusProvider?: {
    type: string;
  };
}

export class ClusterPreferencesStore extends BaseStore<ClusterStoreModel> {
  static get storedKubeConfigFolder(): string {
    return path.resolve((app || remote.app).getPath("userData"), "kubeconfigs");
  }

  static getCustomKubeConfigPath(clusterId: ClusterId): string {
    return path.resolve(ClusterPreferencesStore.storedKubeConfigFolder, clusterId);
  }

  static embedCustomKubeConfig(clusterId: ClusterId, kubeConfig: KubeConfig | string): string {
    const filePath = ClusterPreferencesStore.getCustomKubeConfigPath(clusterId);
    const fileContents = typeof kubeConfig == "string" ? kubeConfig : dumpConfigYaml(kubeConfig);

    saveToAppFiles(filePath, fileContents, { mode: 0o600 });

    return filePath;
  }

  clusterPreferences = observable.map<string, ClusterPreferences>();

  protected disposer = disposer();

  constructor() {
    super({
      configName: "lens-cluster-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
      migrations,
    });
  }

  getById(id: string): ClusterPreferences {
    return this.clusterPreferences.get(id);
  }

  isMetricHidden(resource: ResourceType): boolean {
    if (ipcRenderer) {
      const id = getHostedClusterId();

      return Boolean(this.clusterPreferences.get(id).hiddenMetrics?.includes(resource));
    }

    return true;
  }

  @action
  protected fromStore({ preferences = [] }: ClusterStoreModel = {}) {
    this.clusterPreferences.replace(preferences);
  }

  toJSON(): ClusterStoreModel {
    return toJS({
      preferences: Array.from(this.clusterPreferences.entries()),
    }, {
      recurseEverything: true
    });
  }
}

export function getClusterIdFromHost(host: string): ClusterId | undefined {
  // e.g host == "%clusterId.localhost:45345"
  const subDomains = host.split(":")[0].split(".");

  return subDomains.slice(-2, -1)[0]; // ClusterId or undefined
}

export function getClusterFrameUrl(clusterId: ClusterId) {
  return `//${clusterId}.${location.host}`;
}

export function getHostedClusterId() {
  return getClusterIdFromHost(location.host);
}

export function getHostedCluster() {
  return ClusterPreferencesStore.getInstance().getById(getHostedClusterId());
}
