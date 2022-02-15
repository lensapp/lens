/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
  /**
   * The <img> src for the cluster. If set to `null` that means that it was
   * cleared by preferences.
   */
  icon?: string | null;
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
 * The message format for the "cluster:<cluster-id>:connection-update" channels
 */
export interface KubeAuthUpdate {
  message: string;
  isError: boolean;
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
  refreshMetadata?: boolean;
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
  isAdmin: boolean;
  allowedNamespaces: string[];
  allowedResources: string[];
  isGlobalWatchEnabled: boolean;
}
