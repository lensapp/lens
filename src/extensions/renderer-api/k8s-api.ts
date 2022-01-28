/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import apiManagerInjectable from "../../common/k8s-api/api-manager.injectable";
import configMapApiInjectable from "../../common/k8s-api/endpoints/configmap.api.injectable";
import cronJobApiInjectable from "../../common/k8s-api/endpoints/cron-job.api.injectable";
import daemonSetApiInjectable from "../../common/k8s-api/endpoints/daemon-set.api.injectable";
import deploymentApiInjectable from "../../common/k8s-api/endpoints/deployment.api.injectable";
import horizontalPodAutoscalerApiInjectable from "../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api.injectable";
import jobApiInjectable from "../../common/k8s-api/endpoints/job.api.injectable";
import limitRangeApiInjectable from "../../common/k8s-api/endpoints/limit-range.api.injectable";
import nodeApiInjectable from "../../common/k8s-api/endpoints/node.api.injectable";
import persistentVolumeClaimApiInjectable from "../../common/k8s-api/endpoints/persistent-volume-claim.api.injectable";
import persistentVolumeApiInjectable from "../../common/k8s-api/endpoints/persistent-volume.api.injectable";
import podApiInjectable from "../../common/k8s-api/endpoints/pod.api.injectable";
import replicaSetApiInjectable from "../../common/k8s-api/endpoints/replica-set.api.injectable";
import resourceQuotaApiInjectable from "../../common/k8s-api/endpoints/resource-quota.api.injectable";
import secretApiInjectable from "../../common/k8s-api/endpoints/secret.api.injectable";
import serviceApiInjectable from "../../common/k8s-api/endpoints/service.api.injectable";
import statefulSetApiInjectable from "../../common/k8s-api/endpoints/stateful-set.api.injectable";
import horizontalPodAutoscalerStoreInjectable from "../../renderer/components/+autoscalers/store.injectable";
import limitRangeStoreInjectable from "../../renderer/components/+limit-ranges/store.injectable";
import resourceQuotaStoreInjectable from "../../renderer/components/+resource-quotas/store.injectable";
import secretStoreInjectable from "../../renderer/components/+secrets/store.injectable";
import eventStoreInjectable from "../../renderer/components/+events/store.injectable";
import namespaceStoreInjectable from "../../renderer/components/+namespaces/store.injectable";
import serviceAccountStoreInjectable from "../../renderer/components/+service-accounts/store.injectable";
import cronJobStoreInjectable from "../../renderer/components/+cronjobs/store.injectable";
import jobStoreInjectable from "../../renderer/components/+jobs/store.injectable";
import replicaSetStoreInjectable from "../../renderer/components/+replica-sets/store.injectable";
import { asLegacyGlobalObjectForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import nodeStoreInjectable from "../../renderer/components/+nodes/store.injectable";
import podStoreInjectable from "../../renderer/components/+pods/store.injectable";
import deploymentStoreInjectable from "../../renderer/components/+deployments/store.injectable";
import daemonSetStoreInjectable from "../../renderer/components/+daemonsets/store.injectable";
import statefulSetStoreInjectable from "../../renderer/components/+stateful-sets/store.injectable";
import configMapStoreInjectable from "../../renderer/components/+config-maps/store.injectable";
import persistentVolumeClaimStoreInjectable from "../../renderer/components/+persistent-volume-claims/store.injectable";
import persistentVolumeStoreInjectable from "../../renderer/components/+persistent-volumes/store.injectable";
import podDisruptionBudgetApiInjectable from "../../common/k8s-api/endpoints/pod-disruption-budget.api.injectable";
import podDisruptionBudgetStoreInjectable from "../../renderer/components/+pod-disruption-budgets/store.injectable";
import endpointApiInjectable from "../../common/k8s-api/endpoints/endpoint.api.injectable";
import ingressApiInjectable from "../../common/k8s-api/endpoints/ingress.api.injectable";
import networkPolicyApiInjectable from "../../common/k8s-api/endpoints/network-policy.api.injectable";
import storageClassApiInjectable from "../../common/k8s-api/endpoints/storage-class.api.injectable";
import namespaceApiInjectable from "../../common/k8s-api/endpoints/namespace.api.injectable";
import eventApiInjectable from "../../common/k8s-api/endpoints/event.api.injectable";
import serviceAccountApiInjectable from "../../common/k8s-api/endpoints/service-account.api.injectable";
import endpointStoreInjectable from "../../renderer/components/+endpoints/store.injectable";
import ingressStoreInjectable from "../../renderer/components/+ingresses/store.injectables";
import networkPolicyStoreInjectable from "../../renderer/components/+network-policies/store.injectable";
import storageClassStoreInjectable from "../../renderer/components/+storage-classes/store.injectable";
import roleApiInjectable from "../../common/k8s-api/endpoints/role.api.injectable";
import roleStoreInjectable from "../../renderer/components/+roles/store.injectable";
import roleBindingApiInjectable from "../../common/k8s-api/endpoints/role-binding.api.injectable";
import clusterRoleApiInjectable from "../../common/k8s-api/endpoints/cluster-role.api.injectable";
import clusterRoleBindingApiInjectable from "../../common/k8s-api/endpoints/cluster-role-binding.api.injectable";
import customResourceDefinitionApiInjectable from "../../common/k8s-api/endpoints/custom-resource-definition.api.injectable";
import roleBindingStoreInjectable from "../../renderer/components/+role-bindings/store.injectable";
import clusterRoleStoreInjectable from "../../renderer/components/+cluster-roles/store.injectable";
import clusterRoleBindingStoreInjectable from "../../renderer/components/+cluster-role-bindings/store.injectable";
import customResourceDefinitionStoreInjectable from "../../renderer/components/+custom-resource/store.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import isAllowedResourceInjectable from "../../renderer/utils/allowed-resource.injectable";

export const isAllowedResource = asLegacyGlobalFunctionForExtensionApi(isAllowedResourceInjectable);

export { ResourceStack } from "../../common/k8s/resource-stack";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { KubeObjectStatusLevel } from "./kube-object-status";
export { KubeJsonApi } from "../../common/k8s-api/kube-json-api";
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
export type { ApiManager } from "../../common/k8s-api/api-manager";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints";
export type { ISecretRef } from "../../common/k8s-api/endpoints";
export type { KubeObjectStatus } from "./kube-object-status";

// stores
export type { EventStore } from "../../renderer/components/+events/store";
export type { PodStore as PodsStore } from "../../renderer/components/+pods/store";
export type { NodeStore as NodesStore } from "../../renderer/components/+nodes/store";
export type { DeploymentStore } from "../../renderer/components/+deployments/store";
export type { DaemonSetStore } from "../../renderer/components/+daemonsets/store";
export type { StatefulSetStore } from "../../renderer/components/+stateful-sets/store";
export type { JobStore } from "../../renderer/components/+jobs/store";
export type { CronJobStore } from "../../renderer/components/+cronjobs/store";
export type { ConfigMapStore as ConfigMapsStore } from "../../renderer/components/+config-maps/store";
export type { SecretStore as SecretsStore } from "../../renderer/components/+secrets/store";
export type { ReplicaSetStore } from "../../renderer/components/+replica-sets/store";
export type { ResourceQuotaStore as ResourceQuotasStore } from "../../renderer/components/+resource-quotas/store";
export type { LimitRangeStore as LimitRangesStore } from "../../renderer/components/+limit-ranges/store";
export type { HorizontalPodAutoscalerStore as HPAStore } from "../../renderer/components/+autoscalers/store";
export type { PodDisruptionBudgetStore as PodDisruptionBudgetsStore } from "../../renderer/components/+pod-disruption-budgets/store";
export type { ServiceStore } from "../../renderer/components/+services/store";
export type { EndpointStore } from "../../renderer/components/+endpoints/store";
export type { IngressStore } from "../../renderer/components/+ingresses/store";
export type { NetworkPolicyStore } from "../../renderer/components/+network-policies/store";
export type { PersistentVolumeStore as PersistentVolumesStore } from "../../renderer/components/+persistent-volumes/store";
export type { PersistentVolumeClaimStore as VolumeClaimStore } from "../../renderer/components/+persistent-volume-claims/store";
export type { StorageClassStore } from "../../renderer/components/+storage-classes/store";
export type { NamespaceStore } from "../../renderer/components/+namespaces/store";
export type { ServiceAccountStore as ServiceAccountsStore } from "../../renderer/components/+service-accounts/store";
export type { RoleStore as RolesStore } from "../../renderer/components/+roles/store";
export type { RoleBindingStore as RoleBindingsStore } from "../../renderer/components/+role-bindings/store";
export type { CustomResourceDefinitionStore as CRDStore } from "../../renderer/components/+custom-resource/store";
export type { CRDResourceStore } from "../../renderer/components/+custom-resource/resource.store";

export const apiManager = asLegacyGlobalObjectForExtensionApi(apiManagerInjectable);

export const nodesApi = asLegacyGlobalObjectForExtensionApi(nodeApiInjectable);
export const nodeStore = asLegacyGlobalObjectForExtensionApi(nodeStoreInjectable);

export const podsApi = asLegacyGlobalObjectForExtensionApi(podApiInjectable);
export const podStore = asLegacyGlobalObjectForExtensionApi(podStoreInjectable);

export const serviceApi = asLegacyGlobalObjectForExtensionApi(serviceApiInjectable);

export const deploymentApi = asLegacyGlobalObjectForExtensionApi(deploymentApiInjectable);
export const deploymentStore = asLegacyGlobalObjectForExtensionApi(deploymentStoreInjectable);

export const daemonSetApi = asLegacyGlobalObjectForExtensionApi(daemonSetApiInjectable);
export const daemonSetStore = asLegacyGlobalObjectForExtensionApi(daemonSetStoreInjectable);

export const statefulSetApi = asLegacyGlobalObjectForExtensionApi(statefulSetApiInjectable);
export const statefulSetStore = asLegacyGlobalObjectForExtensionApi(statefulSetStoreInjectable);

export const jobApi = asLegacyGlobalObjectForExtensionApi(jobApiInjectable);
export const jobStore = asLegacyGlobalObjectForExtensionApi(jobStoreInjectable);

export const cronJobApi = asLegacyGlobalObjectForExtensionApi(cronJobApiInjectable);
export const cronJobStore = asLegacyGlobalObjectForExtensionApi(cronJobStoreInjectable);

export const configMapApi = asLegacyGlobalObjectForExtensionApi(configMapApiInjectable);
export const configMapStore = asLegacyGlobalObjectForExtensionApi(configMapStoreInjectable);

export const pvcApi = asLegacyGlobalObjectForExtensionApi(persistentVolumeClaimApiInjectable);
export const persistentVolumeClaimStore = asLegacyGlobalObjectForExtensionApi(persistentVolumeClaimStoreInjectable);

export const persistentVolumeApi = asLegacyGlobalObjectForExtensionApi(persistentVolumeApiInjectable);
export const persistentVolumeStore = asLegacyGlobalObjectForExtensionApi(persistentVolumeStoreInjectable);

export const secretApi = asLegacyGlobalObjectForExtensionApi(secretApiInjectable);
export const secretStore = asLegacyGlobalObjectForExtensionApi(secretStoreInjectable);

export const replicaSetApi = asLegacyGlobalObjectForExtensionApi(replicaSetApiInjectable);
export const replicaSetStore = asLegacyGlobalObjectForExtensionApi(replicaSetStoreInjectable);

export const resourceQuotaApi = asLegacyGlobalObjectForExtensionApi(resourceQuotaApiInjectable);
export const resourceQuotaStore = asLegacyGlobalObjectForExtensionApi(resourceQuotaStoreInjectable);

export const limitRangeApi = asLegacyGlobalObjectForExtensionApi(limitRangeApiInjectable);
export const limitRangeStore = asLegacyGlobalObjectForExtensionApi(limitRangeStoreInjectable);

export const hpaApi = asLegacyGlobalObjectForExtensionApi(horizontalPodAutoscalerApiInjectable);
export const horizontalPodAutoscalerStore = asLegacyGlobalObjectForExtensionApi(horizontalPodAutoscalerStoreInjectable);

export const pdbApi = asLegacyGlobalObjectForExtensionApi(podDisruptionBudgetApiInjectable);
export const podDisruptionBudgetStore = asLegacyGlobalObjectForExtensionApi(podDisruptionBudgetStoreInjectable);

export const endpointApi = asLegacyGlobalObjectForExtensionApi(endpointApiInjectable);
export const endpointStore = asLegacyGlobalObjectForExtensionApi(endpointStoreInjectable);

export const ingressApi = asLegacyGlobalObjectForExtensionApi(ingressApiInjectable);
export const ingressStore = asLegacyGlobalObjectForExtensionApi(ingressStoreInjectable);

export const networkPolicyApi = asLegacyGlobalObjectForExtensionApi(networkPolicyApiInjectable);
export const networkPolicyStore = asLegacyGlobalObjectForExtensionApi(networkPolicyStoreInjectable);

export const storageClassApi = asLegacyGlobalObjectForExtensionApi(storageClassApiInjectable);
export const storageClassStore = asLegacyGlobalObjectForExtensionApi(storageClassStoreInjectable);

export const namespacesApi = asLegacyGlobalObjectForExtensionApi(namespaceApiInjectable);
export const namespaceStore = asLegacyGlobalObjectForExtensionApi(namespaceStoreInjectable);

export const eventApi = asLegacyGlobalObjectForExtensionApi(eventApiInjectable);
export const eventStore = asLegacyGlobalObjectForExtensionApi(eventStoreInjectable);

export const serviceAccountsApi = asLegacyGlobalObjectForExtensionApi(serviceAccountApiInjectable);
export const serviceAccountStore = asLegacyGlobalObjectForExtensionApi(serviceAccountStoreInjectable);

export const roleApi = asLegacyGlobalObjectForExtensionApi(roleApiInjectable);
export const roleStore = asLegacyGlobalObjectForExtensionApi(roleStoreInjectable);

export const roleBindingApi = asLegacyGlobalObjectForExtensionApi(roleBindingApiInjectable);
export const roleBindingStore = asLegacyGlobalObjectForExtensionApi(roleBindingStoreInjectable);

export const clusterRoleApi = asLegacyGlobalObjectForExtensionApi(clusterRoleApiInjectable);
export const clusterRoleStore = asLegacyGlobalObjectForExtensionApi(clusterRoleStoreInjectable);

export const clusterRoleBindingApi = asLegacyGlobalObjectForExtensionApi(clusterRoleBindingApiInjectable);
export const clusterRoleBindingStore = asLegacyGlobalObjectForExtensionApi(clusterRoleBindingStoreInjectable);

export const crdApi = asLegacyGlobalObjectForExtensionApi(customResourceDefinitionApiInjectable);
export const customResourceDefinitionStore = asLegacyGlobalObjectForExtensionApi(customResourceDefinitionStoreInjectable);
