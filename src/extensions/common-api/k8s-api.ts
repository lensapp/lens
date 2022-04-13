/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// NOTE: this file is not currently exported as part of `Common`, but should be.
//       It is here to consolidate the common parts which are exported to `Main`
//       and to `Renderer`

export { ResourceStack } from "../../common/k8s/resource-stack";
export { apiManager } from "../../common/k8s-api/api-manager";

export {
  KubeApi,
  forCluster,
  forRemoteCluster,
  type ILocalKubeApiConfig,
  type IRemoteKubeApiConfig,
  type IKubeApiCluster,
} from "../../common/k8s-api/kube-api";

export {
  KubeObject,
  KubeStatus,
  type KubeObjectMetadata,
  type KubeJsonApiObjectMetadata,
  type KubeStatusData,
} from "../../common/k8s-api/kube-object";

export {
  KubeObjectStore,
  type KubeObjectStoreLoadAllParams,
  type KubeObjectStoreLoadingParams,
  type KubeObjectStoreSubscribeParams,
} from "../../common/k8s-api/kube-object.store";

export {
  type PodContainer as IPodContainer,
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
