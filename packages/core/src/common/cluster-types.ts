/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { z } from "zod";

/**
 * JSON serializable metadata type
 */
export type ClusterMetadata = { [key in string]?: Metadata };

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

export type Literal = z.infer<typeof literalSchema>;
export const literalSchema = z.string().or(z.number()).or(z.boolean());

export type Metadata = Literal | { [key in string]?: Metadata } | Metadata[];
export const metadataSchema: z.ZodType<Metadata> = z.lazy(() => z.union([literalSchema, z.array(metadataSchema), z.record(metadataSchema)]));

export const prometheusPreferencesSchema = z.object({
  namespace: z.string(),
  service: z.string(),
  prefix: z.string(),
  port: z.number(),
});

export const prometheusProviderPreferencesSchema = z.object({
  type: z.string(),
});

export const preferencesSchema = z.object({
  terminalCWD: z.string().min(1).optional(),
  clusterName: z.string().min(1).optional(),
  httpsProxy: z.string().min(1).optional(),
  nodeShellImage: z.string().min(1).optional(),
  imagePullSecret: z.string().min(1).optional(),
  defaultNamespace: z.string().min(1).optional(),
  iconOrder: z.number().optional(),
  icon: z.nullable(z.string()).optional(),
  hiddenMetrics: z.array(z.string()).optional(),
  prometheus: prometheusPreferencesSchema.optional(),
  prometheusProvider: prometheusProviderPreferencesSchema.optional(),
});

/**
 * A type validator for `UpdateClusterModel` so that only expected types are present
 */
export const updateClusterModelSchema = z.object({
  kubeConfigPath: z.string().min(1),
  contextName: z.string().min(1),
  preferences: preferencesSchema.optional(),
  metadata: z.record(metadataSchema).optional(),
  accessibleNamespaces: z.array(z.string()).optional(),
  labels: z.record(z.string()).optional(),
});

/**
 * A type validator for just the `id` fields of `ClusterModel`. The rest is
 * covered by `updateClusterModelChecker`
 */
export const clusterModelIdSchema = z.object({
  id: z.string().min(1),
});

/**
 * The model for passing cluster data around, including to disk
 */
export interface ClusterModel {
  /** Unique id for a cluster */
  id: ClusterId;

  /** Path to cluster kubeconfig */
  kubeConfigPath: string;

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
  labels?: Partial<Record<string, string>>;
}

/**
 * This data is retrieved from the kubeconfig file before calling the cluster constructor.
 *
 * That is done to remove the external dependency on the construction of Cluster instances.
 */
export interface ClusterConfigData {
  clusterServerUrl: string;
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
  level: "info" | "warning" | "error";
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
  VolumeClaim = "PersistentVolumeClaim",
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
 * The data representing a cluster's state, for passing between main and renderer
 */
export interface ClusterState {
  online: boolean;
  disconnected: boolean;
  accessible: boolean;
  ready: boolean;
  isAdmin: boolean;
  allowedNamespaces: string[];
  resourcesToShow: string[];
  isGlobalWatchEnabled: boolean;
}
