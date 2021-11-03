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

/**
 * JSON serializable metadata type
 */
export type ClusterMetadata = Record<string, string | number | boolean | object>;

/**
 * Metadata for cluster's prometheus settings
 */
export interface ClusterPrometheusMetadata {
  success?: boolean;
  provider?: string;
  autoDetected?: boolean;
}

/**
 * A ClusterId is an opaque string
 */
export type ClusterId = string;

/**
 * The fields that are used for updating a cluster instance
 */
export type UpdateClusterModel = Omit<ClusterModel, "id">;

/**
 * The model for passing cluster data around, including to disk
 */
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

  /**
   * @deprecated this is used only for hotbar migrations from 4.2.X
   */
  workspaces?: string[];

  /** User context in kubeconfig  */
  contextName: string;

  /** Preferences */
  preferences?: ClusterPreferences;

  /** Metadata */
  metadata?: ClusterMetadata;

  /** List of accessible namespaces */
  accessibleNamespaces?: string[];

  /**
   * Labels for the catalog entity
   */
  labels?: Record<string, string>;
}

/**
 * The complete set of cluster settings or preferences
 */
export interface ClusterPreferences extends ClusterPrometheusPreferences {
  terminalCWD?: string;
  clusterName?: string;
  iconOrder?: number;
  icon?: string;
  httpsProxy?: string;
  hiddenMetrics?: string[];
  nodeShellImage?: string;
  imagePullSecret?: string;
  defaultNamespace?: string;
}

/**
 * A cluster's prometheus settings (a subset of cluster settings)
 */
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

/**
 * The options for the status of connection attempts to a cluster
 */
export enum ClusterStatus {
  AccessGranted = 2,
  AccessDenied = 1,
  Offline = 0,
}

/**
 * The OpenLens known static metadata keys
 */
export enum ClusterMetadataKey {
  VERSION = "version",
  CLUSTER_ID = "id",
  DISTRIBUTION = "distribution",
  NODES_COUNT = "nodes",
  LAST_SEEN = "lastSeen",
  PROMETHEUS = "prometheus",
}

/**
 * A shorthand enum for resource types that have metrics attached to them via OpenLens metrics stack
 */
export enum ClusterMetricsResourceType {
  Cluster = "Cluster",
  Node = "Node",
  Pod = "Pod",
  Deployment = "Deployment",
  StatefulSet = "StatefulSet",
  Container = "Container",
  Ingress = "Ingress",
  VolumeClaim = "VolumeClaim",
  ReplicaSet = "ReplicaSet",
  DaemonSet = "DaemonSet",
  Job = "Job",
  Namespace = "Namespace",
}

/**
 * The default node shell image
 */
export const initialNodeShellImage = "docker.io/alpine:3.13";

/**
 * The arguments for requesting to refresh a cluster's metadata
 */
export interface ClusterRefreshOptions {
  refreshMetadata?: boolean
}

/**
 * The data representing a cluster's state, for passing between main and renderer
 */
export interface ClusterState {
  apiUrl: string;
  online: boolean;
  disconnected: boolean;
  accessible: boolean;
  ready: boolean;
  failureReason: string;
  isAdmin: boolean;
  allowedNamespaces: string[]
  allowedResources: string[]
  isGlobalWatchEnabled: boolean;
}
