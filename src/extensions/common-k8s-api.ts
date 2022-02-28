/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * This file is for the common exports to both `Renderer.K8sApi` and `Main.K8sApi`
 *
 * It would be nicer if we exported this from `Common.K8sApi` but there doesn't seem
 * to be a good way to deprecate an export so that will have to wait.
 */

export {
  ResourceStack,
} from "../common/k8s/resource-stack";
export {
  KubeObjectStore,
} from "../common/k8s-api/kube-object.store";
export {
  forCluster,
  forRemoteCluster,
  KubeApi,
} from "../common/k8s-api/kube-api";
export type {
  BaseKubeApiOptions,
  DeleteResourceDescriptor,
  KubeApiListOptions,
  KubeApiPatchType,
  KubeApiWatchCallback,
  KubeApiWatchOptions,
  PartialKubeObject,
  PropagationPolicy,
  ResourceDescriptor,
} from "../common/k8s-api/kube-api";
export type {
  IKubeWatchEvent,
} from "../common/k8s-api/kube-watch-event";
export {
  KubeObject,
  KubeStatus,
} from "../common/k8s-api/kube-object";
export type {
  KubeStatusData,
} from "../common/k8s-api/kube-object";
export {
  ClusterRole,
  ClusterRoleApi,
  ClusterRoleBinding,
  ClusterRoleBindingApi,
  ConfigMap,
  ConfigMapApi,
  CronJob,
  CronJobApi,
  CustomResourceDefinition,
  CustomResourceDefinitionApi,
  DaemonSet,
  DaemonSetApi,
  Deployment,
  DeploymentApi,
  Endpoint,
  EndpointApi,
  HorizontalPodAutoscaler,
  HorizontalPodAutoscalerApi,
  Ingress,
  IngressApi,
  Job,
  JobApi,
  KubeEvent,
  KubeEventApi,
  LimitRange,
  LimitRangeApi,
  Namespace,
  NamespaceApi,
  NetworkPolicy,
  NetworkPolicyApi,
  Node,
  NodesApi,
  PersistentVolume,
  PersistentVolumeApi,
  PersistentVolumeClaim,
  PersistentVolumeClaimsApi,
  Pod,
  PodDisruptionBudget,
  PodDisruptionBudgetApi,
  PodsApi,
  ReplicaSet,
  ReplicaSetApi,
  ResourceQuota,
  ResourceQuotaApi,
  Role,
  RoleApi,
  RoleBinding,
  RoleBindingApi,
  Secret,
  SecretApi,
  SecretType,
  Service,
  ServiceAccount,
  ServiceAccountApi,
  ServiceApi,
  StatefulSet,
  StatefulSetApi,
  StorageClass,
  StorageClassApi,
} from "../common/k8s-api/endpoints";
export {
  KubeObjectStatusLevel,
} from "./registries/kube-object-status-registry";
export type {
  IKubeApiCluster,
  IKubeApiOptions,
  IKubeApiQueryParams,
  ILocalKubeApiConfig,
  IRemoteKubeApiConfig,
} from "../common/k8s-api/kube-api";
export type {
  KubeObjectConstructor,
  KubeObjectMetadata,
  LabelMatchExpression,
  LabelSelector,
} from "../common/k8s-api/kube-object";
export type {
  AdditionalPrinterColumnsCommon,
  AdditionalPrinterColumnsV1,
  AdditionalPrinterColumnsV1Beta,
  ClusterRoleBindingSubject,
  ClusterRoleBindingSubjectKind,
  ContainerProbe,
  ContainerState,
  ContainerStateRunning,
  ContainerStateTerminated,
  ContainerStateWaiting,
  CRDVersion,
  CustomResourceDefinitionSpec,
  CustomResourceDefinitionStatus,
  EndpointAddress,
  EndpointSubset,
  HpaMetricType,
  IContainerProbe,
  IEndpointAddress,
  IEndpointPort,
  IEndpointSubset,
  IExtensionsBackend,
  IHpaMetric,
  IHpaMetricData,
  IIngressBackend,
  IIngressService,
  ILoadBalancerIngress,
  INetworkingBackend,
  IPodContainer,
  IPodContainerStatus,
  IPodLogsQuery,
  IPolicyEgress,
  IPolicyIngress,
  IPolicyIpBlock,
  IResourceQuotaValues,
  ISecretRef,
  ITargetRef,
  LimitRangeItem,
  NetworkPolicyPeer,
  NetworkPolicyPort,
  NetworkPolicySpec,
  NodeCondition,
  NodeTaint,
  PodMetrics,
  PodStatus,
  PolicyType,
  RoleBindingSubject,
  RoleBindingSubjectKind,
  SecretData,
  ServicePort,
} from "../common/k8s-api/endpoints";
export type {
  Affinity,
  IAffinity,
  IMatchExpression,
  INodeAffinity,
  IPodAffinity,
  IToleration,
} from "../common/k8s-api/workload-kube-object";
export type {
  KubeObjectStatus,
} from "./registries/kube-object-status-registry";
export type {
  JsonApi,
  JsonApiConfig,
  JsonApiData,
  JsonApiError,
  JsonApiErrorParsed,
  JsonApiLog,
  JsonApiParams,
} from "../common/k8s-api/json-api";
export type {
  KubeJsonApi,
  KubeJsonApiData,
  KubeJsonApiDataList,
  KubeJsonApiListMetadata,
  KubeJsonApiMetadata,
} from "../common/k8s-api/kube-json-api";
