/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeResource } from "../../common/rbac";
import isAllowedResourceInjectable from "../../common/utils/is-allowed-resource.injectable";
import { castArray } from "lodash/fp";
import { getLegacyGlobalDiForExtensionApi } from "../as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import type { BaseKubeJsonApiObjectMetadata } from "../../common/k8s-api/kube-object";
import clusterRoleBindingApiInjectable from "../../common/k8s-api/endpoints/cluster-role-binding.api.injectable";
import clusterRoleApiInjectable from "../../common/k8s-api/endpoints/cluster-role.api.injectable";
import serviceAccountApiInjectable from "../../common/k8s-api/endpoints/service-account.api.injectable";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import roleApiInjectable from "../../common/k8s-api/endpoints/role.api.injectable";
import podApiInjectable from "../../common/k8s-api/endpoints/pod.api.injectable";
import daemonSetApiInjectable from "../../common/k8s-api/endpoints/daemon-set.api.injectable";
import replicaSetApiInjectable from "../../common/k8s-api/endpoints/replica-set.api.injectable";
import statefulSetApiInjectable from "../../common/k8s-api/endpoints/stateful-set.api.injectable";

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

export {
  BaseKubeJsonApiObjectMetadata,
};
export { ResourceStack } from "../../common/k8s/resource-stack";
export { apiManager } from "../../common/k8s-api/api-manager";
export { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { Pod, PodApi as PodsApi } from "../../common/k8s-api/endpoints/pod.api";
export { Node, nodeApi as nodesApi, NodeApi as NodesApi } from "../../common/k8s-api/endpoints/nodes.api";
export { Deployment, deploymentApi, DeploymentApi } from "../../common/k8s-api/endpoints/deployment.api";
export { DaemonSet } from "../../common/k8s-api/endpoints/daemon-set.api";
export { StatefulSet } from "../../common/k8s-api/endpoints/stateful-set.api";
export { Job, jobApi } from "../../common/k8s-api/endpoints/job.api";
export { CronJob, cronJobApi } from "../../common/k8s-api/endpoints/cron-job.api";
export { ConfigMap, configMapApi } from "../../common/k8s-api/endpoints/configmap.api";
export { Secret, secretApi as secretsApi } from "../../common/k8s-api/endpoints/secret.api";
export { ReplicaSet } from "../../common/k8s-api/endpoints/replica-set.api";
export { ResourceQuota, resourceQuotaApi } from "../../common/k8s-api/endpoints/resource-quota.api";
export { LimitRange, limitRangeApi } from "../../common/k8s-api/endpoints/limit-range.api";
export { HorizontalPodAutoscaler, horizontalPodAutoscalerApi as hpaApi } from "../../common/k8s-api/endpoints/hpa.api";
export { PodDisruptionBudget, podDisruptionBudgetApi as pdbApi } from "../../common/k8s-api/endpoints/pod-disruption-budget.api";
export { Service, serviceApi } from "../../common/k8s-api/endpoints/service.api";
export { Endpoints as Endpoint, endpointsApi as endpointApi } from "../../common/k8s-api/endpoints/endpoint.api";
export { Ingress, ingressApi, IngressApi } from "../../common/k8s-api/endpoints/ingress.api";
export { NetworkPolicy, networkPolicyApi } from "../../common/k8s-api/endpoints/network-policy.api";
export { PersistentVolume, persistentVolumeApi } from "../../common/k8s-api/endpoints/persistent-volume.api";
export { PersistentVolumeClaim, persistentVolumeClaimApi as pvcApi, PersistentVolumeClaimApi as PersistentVolumeClaimsApi } from "../../common/k8s-api/endpoints/persistent-volume-claims.api";
export { StorageClass, storageClassApi } from "../../common/k8s-api/endpoints/storage-class.api";
export { Namespace, namespaceApi as namespacesApi } from "../../common/k8s-api/endpoints/namespaces.api";
export { KubeEvent, eventApi } from "../../common/k8s-api/endpoints/events.api";
export { ServiceAccount } from "../../common/k8s-api/endpoints/service-account.api";
export { Role } from "../../common/k8s-api/endpoints/role.api";
export { RoleBinding, roleBindingApi } from "../../common/k8s-api/endpoints/role-binding.api";
export { ClusterRole } from "../../common/k8s-api/endpoints/cluster-role.api";
export { ClusterRoleBinding } from "../../common/k8s-api/endpoints/cluster-role-binding.api";
export { CustomResourceDefinition, crdApi } from "../../common/k8s-api/endpoints/crd.api";
export { KubeObjectStatusLevel } from "./kube-object-status";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { PodContainer as IPodContainer, PodContainerStatus as IPodContainerStatus } from "../../common/k8s-api/endpoints";
export type { SecretReference as ISecretRef } from "../../common/k8s-api/endpoints";
export type { KubeObjectStatus } from "./kube-object-status";
export type { KubeJsonApiObjectMetadata as KubeObjectMetadata, KubeStatusData } from "../../common/k8s-api/kube-object";
export type { KubeObjectStoreLoadAllParams, KubeObjectStoreLoadingParams, KubeObjectStoreSubscribeParams } from "../../common/k8s-api/kube-object.store";

// stores
export type { EventStore } from "../../renderer/components/+events/event.store";
export type { PodStore as PodsStore } from "../../renderer/components/+workloads-pods/store";
export type { NodesStore } from "../../renderer/components/+nodes/nodes.store";
export type { DeploymentStore } from "../../renderer/components/+workloads-deployments/deployments.store";
export type { DaemonSetStore } from "../../renderer/components/+workloads-daemonsets/store";
export type { StatefulSetStore } from "../../renderer/components/+workloads-statefulsets/statefulset.store";
export type { JobStore } from "../../renderer/components/+workloads-jobs/job.store";
export type { CronJobStore } from "../../renderer/components/+workloads-cronjobs/cronjob.store";
export type { ConfigMapStore as ConfigMapsStore } from "../../renderer/components/+config-maps/config-maps.store";
export type { SecretStore as SecretsStore } from "../../renderer/components/+config-secrets/secrets.store";
export type { ReplicaSetStore } from "../../renderer/components/+workloads-replicasets/store";
export type { ResourceQuotaStore as ResourceQuotasStore } from "../../renderer/components/+config-resource-quotas/resource-quotas.store";
export type { LimitRangeStore as LimitRangesStore } from "../../renderer/components/+config-limit-ranges/limit-ranges.store";
export type { HorizontalPodAutoscalerStore as HPAStore } from "../../renderer/components/+config-autoscalers/hpa.store";
export type { PodDisruptionBudgetStore as PodDisruptionBudgetsStore } from "../../renderer/components/+config-pod-disruption-budgets/pod-disruption-budgets.store";
export type { ServiceStore } from "../../renderer/components/+network-services/services.store";
export type { EndpointStore } from "../../renderer/components/+network-endpoints/endpoints.store";
export type { IngressStore } from "../../renderer/components/+network-ingresses/ingress.store";
export type { NetworkPolicyStore } from "../../renderer/components/+network-policies/network-policy.store";
export type { PersistentVolumesStore } from "../../renderer/components/+storage-volumes/volumes.store";
export type { PersistentVolumeClaimStore as VolumeClaimStore } from "../../renderer/components/+storage-volume-claims/volume-claim.store";
export type { StorageClassStore } from "../../renderer/components/+storage-classes/storage-class.store";
export type { NamespaceStore } from "../../renderer/components/+namespaces/namespace-store/namespace.store";
export type { ServiceAccountStore as ServiceAccountsStore } from "../../renderer/components/+user-management/+service-accounts/store";
export type { RoleStore as RolesStore } from "../../renderer/components/+user-management/+roles/store";
export type { RoleBindingStore as RoleBindingsStore } from "../../renderer/components/+user-management/+role-bindings/store";
export type { CRDStore } from "../../renderer/components/+custom-resources/crd.store";
export type { CRDResourceStore } from "../../renderer/components/+custom-resources/crd-resource.store";
