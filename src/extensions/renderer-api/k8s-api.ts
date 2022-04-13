/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeResource } from "../../common/rbac";
import isAllowedResourceInjectable from "../../common/utils/is-allowed-resource.injectable";
import { castArray } from "lodash/fp";
import { getLegacyGlobalDiForExtensionApi } from "../as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import clusterRoleBindingApiInjectable from "../../common/k8s-api/endpoints/cluster-role-binding.api.injectable";
import clusterRoleApiInjectable from "../../common/k8s-api/endpoints/cluster-role.api.injectable";
import serviceAccountApiInjectable from "../../common/k8s-api/endpoints/service-account.api.injectable";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import roleApiInjectable from "../../common/k8s-api/endpoints/role.api.injectable";
import podApiInjectable from "../../common/k8s-api/endpoints/pod.api.injectable";
import daemonSetApiInjectable from "../../common/k8s-api/endpoints/daemon-set.api.injectable";
import replicaSetApiInjectable from "../../common/k8s-api/endpoints/replica-set.api.injectable";
import statefulSetApiInjectable from "../../common/k8s-api/endpoints/stateful-set.api.injectable";
import deploymentApiInjectable from "../../common/k8s-api/endpoints/deployment.api.injectable";
import jobApiInjectable from "../../common/k8s-api/endpoints/job.api.injectable";
import cronJobApiInjectable from "../../common/k8s-api/endpoints/cron-job.api.injectable";
import nodeApiInjectable from "../../common/k8s-api/endpoints/node.api.injectable";
import configMapApiInjectable from "../../common/k8s-api/endpoints/config-map.api.injectable";
import secretApiInjectable from "../../common/k8s-api/endpoints/secret.api.injectable";
import resourceQuotaApiInjectable from "../../common/k8s-api/endpoints/resource-quota.api.injectable";
import limitRangeApiInjectable from "../../common/k8s-api/endpoints/limit-range.api.injectable";
import horizontalPodAutoscalerApiInjectable from "../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api.injectable";
import podDisruptionBudgetApiInjectable from "../../common/k8s-api/endpoints/pod-disruption-budget.api.injectable";
import serviceApiInjectable from "../../common/k8s-api/endpoints/service.api.injectable";
import endpointsApiInjectable from "../../common/k8s-api/endpoints/endpoint.api.injectable";
import ingressApiInjectable from "../../common/k8s-api/endpoints/ingress.api.injectable";
import networkPolicyApiInjectable from "../../common/k8s-api/endpoints/network-policy.api.injectable";
import persistentVolumeApiInjectable from "../../common/k8s-api/endpoints/persistent-volume.api.injectable";
import persistentVolumeClaimApiInjectable from "../../common/k8s-api/endpoints/persistent-volume-claim.api.injectable";
import storageClassApiInjectable from "../../common/k8s-api/endpoints/storage-class.api.injectable";
import namespaceApiInjectable from "../../common/k8s-api/endpoints/namespace.api.injectable";
import kubeEventApiInjectable from "../../common/k8s-api/endpoints/events.api.injectable";
import roleBindingApiInjectable from "../../common/k8s-api/endpoints/role-binding.api.injectable";
import customResourceDefinitionApiInjectable from "../../common/k8s-api/endpoints/custom-resource-definition.api.injectable";

export function isAllowedResource(resource: KubeResource | KubeResource[]) {
  const resources = castArray(resource);
  const di = getLegacyGlobalDiForExtensionApi();

  return resources.every((resourceName: any) => {
    const _isAllowedResource = di.inject(isAllowedResourceInjectable, resourceName);

    // Note: Legacy isAllowedResource does not advertise reactivity
    return _isAllowedResource.get();
  });
}

export const serviceAccountsApi = asLegacyGlobalForExtensionApi(serviceAccountApiInjectable);
export const clusterRoleApi = asLegacyGlobalForExtensionApi(clusterRoleApiInjectable);
export const clusterRoleBindingApi = asLegacyGlobalForExtensionApi(clusterRoleBindingApiInjectable);
export const roleApi = asLegacyGlobalForExtensionApi(roleApiInjectable);
export const podsApi = asLegacyGlobalForExtensionApi(podApiInjectable);
export const daemonSetApi = asLegacyGlobalForExtensionApi(daemonSetApiInjectable);
export const replicaSetApi = asLegacyGlobalForExtensionApi(replicaSetApiInjectable);
export const statefulSetApi = asLegacyGlobalForExtensionApi(statefulSetApiInjectable);
export const deploymentApi = asLegacyGlobalForExtensionApi(deploymentApiInjectable);
export const jobApi = asLegacyGlobalForExtensionApi(jobApiInjectable);
export const cronJobApi = asLegacyGlobalForExtensionApi(cronJobApiInjectable);
export const nodesApi = asLegacyGlobalForExtensionApi(nodeApiInjectable);
export const secretsApi = asLegacyGlobalForExtensionApi(secretApiInjectable);
export const configMapApi = asLegacyGlobalForExtensionApi(configMapApiInjectable);
export const resourceQuotaApi = asLegacyGlobalForExtensionApi(resourceQuotaApiInjectable);
export const limitRangeApi = asLegacyGlobalForExtensionApi(limitRangeApiInjectable);
export const serviceApi = asLegacyGlobalForExtensionApi(serviceApiInjectable);
export const hpaApi = asLegacyGlobalForExtensionApi(horizontalPodAutoscalerApiInjectable);
export const pdbApi = asLegacyGlobalForExtensionApi(podDisruptionBudgetApiInjectable);
export const endpointApi = asLegacyGlobalForExtensionApi(endpointsApiInjectable);
export const ingressApi = asLegacyGlobalForExtensionApi(ingressApiInjectable);
export const networkPolicyApi = asLegacyGlobalForExtensionApi(networkPolicyApiInjectable);
export const persistentVolumeApi = asLegacyGlobalForExtensionApi(persistentVolumeApiInjectable);
export const pvcApi = asLegacyGlobalForExtensionApi(persistentVolumeClaimApiInjectable);
export const storageClassApi = asLegacyGlobalForExtensionApi(storageClassApiInjectable);
export const namespacesApi = asLegacyGlobalForExtensionApi(namespaceApiInjectable);
export const eventApi = asLegacyGlobalForExtensionApi(kubeEventApiInjectable);
export const roleBindingApi = asLegacyGlobalForExtensionApi(roleBindingApiInjectable);
export const crdApi = asLegacyGlobalForExtensionApi(customResourceDefinitionApiInjectable);

export * from "../common-api/k8s-api";

export {
  KubeObjectStatusLevel,
  type KubeObjectStatus,
} from "../../common/k8s-api/kube-object-status";

// stores
export type { EventStore } from "../../renderer/components/+events/store";
export type { PodStore as PodsStore } from "../../renderer/components/+workloads-pods/store";
export type { NodeStore as NodesStore } from "../../renderer/components/+nodes/store";
export type { DeploymentStore } from "../../renderer/components/+workloads-deployments/store";
export type { DaemonSetStore } from "../../renderer/components/+workloads-daemonsets/store";
export type { StatefulSetStore } from "../../renderer/components/+workloads-statefulsets/store";
export type { JobStore } from "../../renderer/components/+workloads-jobs/store";
export type { CronJobStore } from "../../renderer/components/+workloads-cronjobs/store";
export type { ConfigMapStore as ConfigMapsStore } from "../../renderer/components/+config-maps/store";
export type { SecretStore as SecretsStore } from "../../renderer/components/+config-secrets/store";
export type { ReplicaSetStore } from "../../renderer/components/+workloads-replicasets/store";
export type { ResourceQuotaStore as ResourceQuotasStore } from "../../renderer/components/+config-resource-quotas/store";
export type { LimitRangeStore as LimitRangesStore } from "../../renderer/components/+config-limit-ranges/store";
export type { HorizontalPodAutoscalerStore as HPAStore } from "../../renderer/components/+config-autoscalers/store";
export type { PodDisruptionBudgetStore as PodDisruptionBudgetsStore } from "../../renderer/components/+config-pod-disruption-budgets/store";
export type { ServiceStore } from "../../renderer/components/+network-services/store";
export type { EndpointsStore as EndpointStore } from "../../renderer/components/+network-endpoints/store";
export type { IngressStore } from "../../renderer/components/+network-ingresses/store";
export type { NetworkPolicyStore } from "../../renderer/components/+network-policies/store";
export type { PersistentVolumeStore as PersistentVolumesStore } from "../../renderer/components/+storage-volumes/store";
export type { PersistentVolumeClaimStore as VolumeClaimStore } from "../../renderer/components/+storage-volume-claims/store";
export type { StorageClassStore } from "../../renderer/components/+storage-classes/store";
export type { NamespaceStore } from "../../renderer/components/+namespaces/namespace-store/namespace.store";
export type { ServiceAccountStore as ServiceAccountsStore } from "../../renderer/components/+user-management/+service-accounts/store";
export type { RoleStore as RolesStore } from "../../renderer/components/+user-management/+roles/store";
export type { RoleBindingStore as RoleBindingsStore } from "../../renderer/components/+user-management/+role-bindings/store";
export type { CustomResourceDefinitionStore as CRDStore } from "../../renderer/components/+custom-resources/definition.store";
export type { CustomResourceStore as CRDResourceStore } from "../../renderer/components/+custom-resources/resource.store";
