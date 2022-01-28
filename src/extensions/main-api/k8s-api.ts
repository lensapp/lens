/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export { ResourceStack } from "../../common/k8s/resource-stack";
export { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export {
  Pod, PodApi as PodsApi,
  Node, NodeApi as NodesApi,
  Deployment, DeploymentApi,
  DaemonSet, DaemonSetApi,
  StatefulSet, StatefulSetApi,
  Job, JobApi,
  CronJob, CronJobApi,
  ConfigMap, ConfigMapApi,
  Secret, SecretApi,
  ReplicaSet, ReplicaSetApi,
  ResourceQuota, ResourceQuotaApi,
  LimitRange, LimitRangeApi,
  HorizontalPodAutoscaler, HorizontalPodAutoscalerApi,
  PodDisruptionBudget, PodDisruptionBudgetApi,
  Service, ServiceApi,
  Endpoint, EndpointApi,
  Ingress, IngressApi,
  NetworkPolicy, NetworkPolicyApi,
  PersistentVolume, PersistentVolumeApi,
  PersistentVolumeClaim, PersistentVolumeClaimApi as PersistentVolumeClaimsApi,
  StorageClass, StorageClassApi,
  Namespace, NamespaceApi,
  Event as KubeEvent, EventApi,
  ServiceAccount, ServiceAccountApi,
  Role, RoleApi,
  RoleBinding, RoleBindingApi,
  ClusterRole, ClusterRoleApi,
  ClusterRoleBinding, ClusterRoleBindingApi,
  CustomResourceDefinition, CustomResourceDefinitionApi,
} from "../../common/k8s-api/endpoints";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints/pod.api";
export type { ISecretRef } from "../../common/k8s-api/endpoints/secret.api";
