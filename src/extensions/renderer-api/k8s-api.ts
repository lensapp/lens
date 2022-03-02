/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeResource } from "../../common/rbac";
import isAllowedResourceInjectable from "../../common/utils/is-allowed-resource.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { castArray } from "lodash/fp";

export function isAllowedResource(resource: KubeResource | KubeResource[]) {
  const _isAllowedResource = asLegacyGlobalFunctionForExtensionApi(isAllowedResourceInjectable);

  const resources = castArray(resource);

  return resources.every(x => _isAllowedResource(x));
}

export { ResourceStack } from "../../common/k8s/resource-stack";
export { apiManager } from "../../common/k8s-api/api-manager";
export { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
export { KubeApi, forCluster, forRemoteCluster } from "../../common/k8s-api/kube-api";
export { KubeObject, KubeStatus } from "../../common/k8s-api/kube-object";
export { Pod, podsApi, PodsApi } from "../../common/k8s-api/endpoints";
export { Node, nodesApi, NodesApi } from "../../common/k8s-api/endpoints";
export { Deployment, deploymentApi, DeploymentApi } from "../../common/k8s-api/endpoints";
export { DaemonSet, daemonSetApi } from "../../common/k8s-api/endpoints";
export { StatefulSet, statefulSetApi } from "../../common/k8s-api/endpoints";
export { Job, jobApi } from "../../common/k8s-api/endpoints";
export { CronJob, cronJobApi } from "../../common/k8s-api/endpoints";
export { ConfigMap, configMapApi } from "../../common/k8s-api/endpoints";
export { Secret, secretsApi } from "../../common/k8s-api/endpoints";
export { ReplicaSet, replicaSetApi } from "../../common/k8s-api/endpoints";
export { ResourceQuota, resourceQuotaApi } from "../../common/k8s-api/endpoints";
export { LimitRange, limitRangeApi } from "../../common/k8s-api/endpoints";
export { HorizontalPodAutoscaler, hpaApi } from "../../common/k8s-api/endpoints";
export { PodDisruptionBudget, pdbApi } from "../../common/k8s-api/endpoints";
export { Service, serviceApi } from "../../common/k8s-api/endpoints";
export { Endpoint, endpointApi } from "../../common/k8s-api/endpoints";
export { Ingress, ingressApi, IngressApi } from "../../common/k8s-api/endpoints";
export { NetworkPolicy, networkPolicyApi } from "../../common/k8s-api/endpoints";
export { PersistentVolume, persistentVolumeApi } from "../../common/k8s-api/endpoints";
export { PersistentVolumeClaim, pvcApi, PersistentVolumeClaimsApi } from "../../common/k8s-api/endpoints";
export { StorageClass, storageClassApi } from "../../common/k8s-api/endpoints";
export { Namespace, namespacesApi } from "../../common/k8s-api/endpoints";
export { KubeEvent, eventApi } from "../../common/k8s-api/endpoints";
export { ServiceAccount, serviceAccountsApi } from "../../common/k8s-api/endpoints";
export { Role, roleApi } from "../../common/k8s-api/endpoints";
export { RoleBinding, roleBindingApi } from "../../common/k8s-api/endpoints";
export { ClusterRole, clusterRoleApi } from "../../common/k8s-api/endpoints";
export { ClusterRoleBinding, clusterRoleBindingApi } from "../../common/k8s-api/endpoints";
export { CustomResourceDefinition, crdApi } from "../../common/k8s-api/endpoints";
export { KubeObjectStatusLevel } from "./kube-object-status";
export { KubeJsonApi } from "../../common/k8s-api/kube-json-api";

// types
export type { ILocalKubeApiConfig, IRemoteKubeApiConfig, IKubeApiCluster } from "../../common/k8s-api/kube-api";
export type { IPodContainer, IPodContainerStatus } from "../../common/k8s-api/endpoints";
export type { ISecretRef } from "../../common/k8s-api/endpoints";
export type { KubeObjectStatus } from "./kube-object-status";
export type { KubeObjectMetadata, KubeStatusData } from "../../common/k8s-api/kube-object";
export type { KubeObjectStoreLoadAllParams, KubeObjectStoreLoadingParams, KubeObjectStoreSubscribeParams } from "../../common/k8s-api/kube-object.store";

// stores
export type { EventStore } from "../../renderer/components/+events/event.store";
export type { PodsStore } from "../../renderer/components/+workloads-pods/pods.store";
export type { NodesStore } from "../../renderer/components/+nodes/nodes.store";
export type { DeploymentStore } from "../../renderer/components/+workloads-deployments/deployments.store";
export type { DaemonSetStore } from "../../renderer/components/+workloads-daemonsets/daemonsets.store";
export type { StatefulSetStore } from "../../renderer/components/+workloads-statefulsets/statefulset.store";
export type { JobStore } from "../../renderer/components/+workloads-jobs/job.store";
export type { CronJobStore } from "../../renderer/components/+workloads-cronjobs/cronjob.store";
export type { ConfigMapsStore } from "../../renderer/components/+config-maps/config-maps.store";
export type { SecretsStore } from "../../renderer/components/+config-secrets/secrets.store";
export type { ReplicaSetStore } from "../../renderer/components/+workloads-replicasets/replicasets.store";
export type { ResourceQuotasStore } from "../../renderer/components/+config-resource-quotas/resource-quotas.store";
export type { LimitRangesStore } from "../../renderer/components/+config-limit-ranges/limit-ranges.store";
export type { HPAStore } from "../../renderer/components/+config-autoscalers/hpa.store";
export type { PodDisruptionBudgetsStore } from "../../renderer/components/+config-pod-disruption-budgets/pod-disruption-budgets.store";
export type { ServiceStore } from "../../renderer/components/+network-services/services.store";
export type { EndpointStore } from "../../renderer/components/+network-endpoints/endpoints.store";
export type { IngressStore } from "../../renderer/components/+network-ingresses/ingress.store";
export type { NetworkPolicyStore } from "../../renderer/components/+network-policies/network-policy.store";
export type { PersistentVolumesStore } from "../../renderer/components/+storage-volumes/volumes.store";
export type { VolumeClaimStore } from "../../renderer/components/+storage-volume-claims/volume-claim.store";
export type { StorageClassStore } from "../../renderer/components/+storage-classes/storage-class.store";
export type { NamespaceStore } from "../../renderer/components/+namespaces/namespace-store/namespace.store";
export type { ServiceAccountsStore } from "../../renderer/components/+user-management/+service-accounts/store";
export type { RolesStore } from "../../renderer/components/+user-management/+roles/store";
export type { RoleBindingsStore } from "../../renderer/components/+user-management/+role-bindings/store";
export type { CRDStore } from "../../renderer/components/+custom-resources/crd.store";
export type { CRDResourceStore } from "../../renderer/components/+custom-resources/crd-resource.store";
