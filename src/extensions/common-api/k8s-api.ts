/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// NOTE: this file is not currently exported as part of `Common`, but should be.
//       It is here to consolidate the common parts which are exported to `Main`
//       and to `Renderer`

import apiManagerInjectable from "../../common/k8s-api/api-manager/manager.injectable";
import createKubeApiForClusterInjectable from "../../common/k8s-api/create-kube-api-for-cluster.injectable";
import createKubeApiForRemoteClusterInjectable from "../../common/k8s-api/create-kube-api-for-remote-cluster.injectable";
import createResourceStackInjectable from "../../common/k8s/create-resource-stack.injectable";
import type { ResourceApplyingStack } from "../../common/k8s/resource-stack";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import type { KubernetesCluster } from "./catalog";

export const apiManager = asLegacyGlobalForExtensionApi(apiManagerInjectable);
export const forCluster = asLegacyGlobalFunctionForExtensionApi(createKubeApiForClusterInjectable);
export const forRemoteCluster = asLegacyGlobalFunctionForExtensionApi(createKubeApiForRemoteClusterInjectable);

export { KubeApi } from "../../common/k8s-api/kube-api";

export const createResourceStack = asLegacyGlobalFunctionForExtensionApi(createResourceStackInjectable);

/**
 * @deprecated Switch to using `Common.createResourceStack` instead
 */
export class ResourceStack implements ResourceApplyingStack {
  private readonly impl: ResourceApplyingStack;

  constructor(cluster: KubernetesCluster, name: string) {
    this.impl = createResourceStack(cluster, name);
  }

  kubectlApplyFolder(folderPath: string, templateContext?: any, extraArgs?: string[] | undefined): Promise<string> {
    return this.impl.kubectlApplyFolder(folderPath, templateContext, extraArgs);
  }

  kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[] | undefined): Promise<string> {
    return this.impl.kubectlDeleteFolder(folderPath, templateContext, extraArgs);
  }
}

/**
 * @deprecated This type is unused
 */
export interface IKubeApiCluster {
  metadata: {
    uid: string;
  };
}

export type { CreateKubeApiForRemoteClusterConfig as IRemoteKubeApiConfig } from "../../common/k8s-api/create-kube-api-for-remote-cluster.injectable";
export type { CreateKubeApiForLocalClusterConfig as ILocalKubeApiConfig } from "../../common/k8s-api/create-kube-api-for-cluster.injectable";

export {
  KubeObject,
  KubeStatus,
  type OwnerReference,
  type KubeObjectMetadata,
  type NamespaceScopedMetadata,
  type ClusterScopedMetadata,
  type BaseKubeJsonApiObjectMetadata,
  type KubeJsonApiObjectMetadata,
  type KubeStatusData,
} from "../../common/k8s-api/kube-object";

export {
  KubeJsonApi,
  type KubeJsonApiData,
} from "../../common/k8s-api/kube-json-api";

export {
  KubeObjectStore,
  type JsonPatch,
  type KubeObjectStoreLoadAllParams,
  type KubeObjectStoreLoadingParams,
  type KubeObjectStoreSubscribeParams,
} from "../../common/k8s-api/kube-object.store";

export {
  type Container as IPodContainer,
  type PodContainerStatus as IPodContainerStatus,
  Pod,
  PodApi as PodsApi,
  Node,
  NodeApi as NodesApi,
  Deployment,
  DeploymentApi,
  DaemonSet,
  StatefulSet,
  Job,
  CronJob,
  ConfigMap,
  type SecretReference as ISecretRef,
  Secret,
  ReplicaSet,
  ResourceQuota,
  LimitRange,
  HorizontalPodAutoscaler,
  PodDisruptionBudget,
  PriorityClass,
  Service,
  Endpoints as Endpoint,
  Ingress, IngressApi,
  NetworkPolicy,
  PersistentVolume,
  PersistentVolumeClaim,
  PersistentVolumeClaimApi as PersistentVolumeClaimsApi,
  StorageClass,
  Namespace,
  KubeEvent,
  ServiceAccount,
  Role,
  RoleBinding,
  ClusterRole,
  ClusterRoleBinding,
  CustomResourceDefinition,
} from "../../common/k8s-api/endpoints";
